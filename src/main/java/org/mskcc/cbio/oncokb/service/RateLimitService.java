package org.mskcc.cbio.oncokb.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.jhipster.config.JHipsterProperties;
import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.mskcc.cbio.oncokb.config.cache.Buckert4jProxyManager;
import org.redisson.config.Config;
import org.redisson.config.ConfigSupport;
import org.redisson.connection.ConnectionManager;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private static final String CACHE_KEY_PREFIX = "rate-limit-";
    private static final Bandwidth DEFAULT_BUCKET_BANDWIDTH = Bandwidth.simple(10, Duration.ofSeconds(1));
    private static final BucketConfiguration DEFAULT_BUCKET_CONFIG = BucketConfiguration.builder()
        .addLimit(DEFAULT_BUCKET_BANDWIDTH)
        .build();

    // local bucket when redis is not available
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private CacheNameResolver cacheNameResolver;
    private Buckert4jProxyManager proxyManager;

    public RateLimitService(Optional<Config> redissonConfigOptional, CacheNameResolver cacheNameResolver, JHipsterProperties jHipsterProperties) {
        this.cacheNameResolver = cacheNameResolver;

        if (redissonConfigOptional.isPresent()) {
            ConnectionManager manager = ConfigSupport.createConnectionManager(redissonConfigOptional.get());
            this.proxyManager = new Buckert4jProxyManager(manager.getCommandExecutor(), Duration.ofSeconds(jHipsterProperties.getCache().getRedis().getExpiration()));
        }
    }

    public Bucket resolveBucket(String key) {
        if (proxyManager != null) {
            return proxyManager.builder().build(this.cacheNameResolver.getCacheName(CACHE_KEY_PREFIX + key), DEFAULT_BUCKET_CONFIG);
        } else {
            return cache.computeIfAbsent(key, this::newBucket);
        }
    }

    private Bucket newBucket(String apiKey) {
        return Bucket.builder().addLimit(DEFAULT_BUCKET_BANDWIDTH).build();
    }
}
