package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.redisson.spring.session.RedissonSessionRepository;
import org.redisson.spring.session.config.RedissonHttpSessionConfiguration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Persists HTTP sessions in Redis so that authenticated OAuth sessions survive pod restarts and are
 * shared across instances. Spring Session swaps the container's HttpSession for a Redis-backed one via
 * a SessionRepositoryFilter, so the SecurityContext saved in {@code CustomOAuthSuccessHandler} is stored
 * in Redis transparently.
 *
 * <p>This uses a dedicated {@code application.session.redis} connection, separate from the data-cache
 * {@code application.redis} used by {@link CacheConfiguration}. The two serve different purposes and are
 * enabled independently: persisting sessions does not require the data cache, and vice versa. When
 * {@code application.session.redis.enabled} is false, sessions fall back to the in-memory HttpSession.
 *
 * <p>This extends {@link RedissonHttpSessionConfiguration} directly (instead of using
 * {@code @EnableRedissonHttpSession}) so the idle session timeout can be driven by the
 * {@code application.session.timeout-seconds} property rather than a compile-time annotation constant.
 */
@Configuration
@ConditionalOnProperty(prefix = "application.session.redis", name = "enabled", havingValue = "true")
public class HttpSessionConfiguration extends RedissonHttpSessionConfiguration {

    public HttpSessionConfiguration(ApplicationProperties applicationProperties) {
        // Set before the sessionRepository @Bean method is invoked. @EnableRedissonHttpSession would
        // normally supply this via setImportMetadata, which is not called when we subclass directly.
        setMaxInactiveIntervalInSeconds(applicationProperties.getSession().getTimeoutSeconds());
    }

    /**
     * Dedicated Redisson client for the session store. Named distinctly so it does not collide with the
     * data-cache {@code redissonClient} bean when both Redis instances are enabled.
     */
    @Bean(destroyMethod = "shutdown")
    public RedissonClient sessionRedissonClient(ApplicationProperties applicationProperties) throws Exception {
        Config config = RedissonConfigFactory.createConfig(applicationProperties.getSession().getRedis(), applicationProperties.getName());
        return Redisson.create(config);
    }

    /**
     * Overrides the parent @Bean to pin the session repository to {@link #sessionRedissonClient}. The
     * parent injects an unqualified {@code RedissonClient}, which would otherwise resolve to the data-cache
     * client when both are present.
     */
    @Bean
    @Override
    public RedissonSessionRepository sessionRepository(
        @Qualifier("sessionRedissonClient") RedissonClient redissonClient,
        ApplicationEventPublisher eventPublisher
    ) {
        return super.sessionRepository(redissonClient, eventPublisher);
    }
}
