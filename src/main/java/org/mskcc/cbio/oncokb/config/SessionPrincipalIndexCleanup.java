package org.mskcc.cbio.oncokb.config;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.data.redis.RedisIndexedSessionRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * Removes stale Spring Session principal index members when an expiration/delete event was missed.
 *
 * <p>Spring Session Redis 2.x removes principal index members from Redis keyspace notification
 * callbacks. If the backing session hash is already gone when the callback runs, Spring Session
 * returns before it can resolve the principal and remove the stale index member. Upgrading to a
 * version with newer Redis expiration handling is not a small dependency bump for this app because
 * Spring Session 3.x requires the Spring Boot 3 / Spring Framework 6 / Jakarta Servlet stack, while
 * this application is still on Spring Boot 2.x and javax.servlet.
 */
@Component
@ConditionalOnProperty(prefix = "application.session.redis", name = "enabled", havingValue = "true")
public class SessionPrincipalIndexCleanup {

    private static final Logger log = LoggerFactory.getLogger(SessionPrincipalIndexCleanup.class);

    private static final String DEFAULT_SESSION_NAMESPACE = "spring:session";

    private final RedisOperations<Object, Object> redisOperations;
    private final StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
    private final String sessionKeyPrefix;
    private final String principalIndexKeyPrefix;

    public SessionPrincipalIndexCleanup(RedisIndexedSessionRepository redisIndexedSessionRepository, ApplicationProperties applicationProperties) {
        this.redisOperations = redisIndexedSessionRepository.getSessionRedisOperations();
        String sessionNamespace = getSessionNamespace(applicationProperties) + ":";
        this.sessionKeyPrefix = sessionNamespace + "sessions:";
        this.principalIndexKeyPrefix = sessionNamespace +
            "index:" +
            FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME +
            ":";
    }

    public static String getSessionNamespace(ApplicationProperties applicationProperties) {
        String appName = StringUtils.trimToNull(applicationProperties.getName());
        if (appName == null) {
            return DEFAULT_SESSION_NAMESPACE;
        }
        return DEFAULT_SESSION_NAMESPACE + ":" + appName;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void cleanUpStaleSessionsAfterStartup() {
        cleanUpStaleSessions();
    }

    @Scheduled(
        fixedDelayString = "${application.session.redis.stale-session-cleanup-interval-ms:300000}",
        initialDelayString = "${application.session.redis.stale-session-cleanup-initial-delay-ms:60000}"
    )
    public void cleanUpStaleSessions() {
        try {
            CleanupResult result = cleanUpStaleSessionsInternal();
            if (result.removedMembers > 0) {
                log.info(
                    "Removed {} stale Spring Session principal index member(s) from {} principal index key(s)",
                    result.removedMembers,
                    result.cleanedIndexKeys
                );
            } else {
                log.debug("Checked {} Spring Session principal index key(s); no stale members found", result.scannedIndexKeys);
            }
        } catch (RuntimeException exception) {
            log.warn("Unable to clean stale Spring Session principal index entries", exception);
        }
    }

    private CleanupResult cleanUpStaleSessionsInternal() {
        CleanupResult result = new CleanupResult();
        for (String indexKey : scanPrincipalIndexKeys()) {
            result.scannedIndexKeys++;
            long removed = removeStaleSessionIds(indexKey);
            if (removed > 0) {
                result.cleanedIndexKeys++;
                result.removedMembers += removed;
            }
        }
        return result;
    }

    private List<String> scanPrincipalIndexKeys() {
        List<String> keys = redisOperations.execute((RedisCallback<List<String>>) connection -> {
            List<String> scannedKeys = new ArrayList<>();
            ScanOptions options = ScanOptions.scanOptions()
                .match(principalIndexKeyPrefix + "*")
                .count(100)
                .build();

            try (Cursor<byte[]> cursor = connection.scan(options)) {
                while (cursor.hasNext()) {
                    String key = stringRedisSerializer.deserialize(cursor.next());
                    if (key != null) {
                        scannedKeys.add(key);
                    }
                }
            } catch (IOException exception) {
                throw new IllegalStateException("Unable to scan Spring Session principal index keys", exception);
            }

            return scannedKeys;
        });

        return keys == null ? Collections.emptyList() : keys;
    }

    private long removeStaleSessionIds(String indexKey) {
        Set<Object> sessionIds = redisOperations.boundSetOps(indexKey).members();
        if (sessionIds == null || sessionIds.isEmpty()) {
            return 0;
        }

        long removed = 0;
        for (Object sessionId : sessionIds) {
            if (!(sessionId instanceof String)) {
                log.debug("Skipping Spring Session principal index member with unexpected type {}", sessionId.getClass().getName());
                continue;
            }
            if (Boolean.TRUE.equals(redisOperations.hasKey(sessionKeyPrefix + sessionId))) {
                continue;
            }

            Long removedCount = redisOperations.boundSetOps(indexKey).remove(sessionId);
            if (removedCount != null) {
                removed += removedCount;
            }
        }

        return removed;
    }

    private static final class CleanupResult {
        private int scannedIndexKeys;
        private int cleanedIndexKeys;
        private long removedMembers;
    }
}
