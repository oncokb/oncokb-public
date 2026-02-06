package org.mskcc.cbio.oncokb.service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.RateLimitProperties;
import org.mskcc.cbio.oncokb.config.cache.Buckert4jProxyManager;
import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.redisson.config.Config;
import org.redisson.config.ConfigSupport;
import org.redisson.connection.ConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.jhipster.config.JHipsterProperties;

@Service
public class RateLimitService {
    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);
    private static final String CACHE_KEY_PREFIX = "rate-limit-";
    private static final long DEFAULT_CAPACITY = 10L;
    private static final Duration DEFAULT_REFILL_PERIOD = Duration.ofSeconds(1);

    private final Bandwidth bucketBandwidth;
    private final BucketConfiguration bucketConfiguration;
    private final long configuredCapacity;
    private final Duration configuredRefillPeriod;

    // local bucket when redis is not available
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private CacheNameResolver cacheNameResolver;
    private Buckert4jProxyManager proxyManager;

    public RateLimitService(Optional<Config> redissonConfigOptional,
                            CacheNameResolver cacheNameResolver,
                            JHipsterProperties jHipsterProperties,
                            ApplicationProperties applicationProperties) {
        this.cacheNameResolver = cacheNameResolver;

        Optional<RateLimitProperties> rateLimitProperties = Optional.ofNullable(applicationProperties != null ? applicationProperties.getRateLimit() : null);
        long configuredCapacity = rateLimitProperties.map(RateLimitProperties::getCapacity).orElse(DEFAULT_CAPACITY);
        Duration configuredRefillPeriod = rateLimitProperties.map(RateLimitProperties::getRefillPeriod).orElse(DEFAULT_REFILL_PERIOD);

        if (configuredCapacity <= 0) {
            configuredCapacity = DEFAULT_CAPACITY;
        }
        if (configuredRefillPeriod == null || configuredRefillPeriod.isZero() || configuredRefillPeriod.isNegative()) {
            configuredRefillPeriod = DEFAULT_REFILL_PERIOD;
        }

        this.configuredCapacity = configuredCapacity;
        this.configuredRefillPeriod = configuredRefillPeriod;
        this.bucketBandwidth = Bandwidth.simple(this.configuredCapacity, this.configuredRefillPeriod);
        this.bucketConfiguration = BucketConfiguration.builder()
            .addLimit(this.bucketBandwidth)
            .build();

        log.info("Rate limit bucket configured for capacity={} tokens with refill period={} (from config: {})",
            this.configuredCapacity,
            this.configuredRefillPeriod,
            rateLimitProperties.isPresent());

        if (redissonConfigOptional.isPresent()) {
            ConnectionManager manager = ConfigSupport.createConnectionManager(redissonConfigOptional.get());
            this.proxyManager = new Buckert4jProxyManager(manager.getCommandExecutor(), Duration.ofSeconds(jHipsterProperties.getCache().getRedis().getExpiration()));
        }
    }

    public Bucket resolveBucket(String key) {
        if (proxyManager != null) {
            return proxyManager.builder().build(this.cacheNameResolver.getCacheName(CACHE_KEY_PREFIX + key), this.bucketConfiguration);
        } else {
            return cache.computeIfAbsent(key, this::newBucket);
        }
    }

    private Bucket newBucket(String apiKey) {
        return Bucket.builder().addLimit(this.bucketBandwidth).build();
    }

    public long getConfiguredCapacity() {
        return configuredCapacity;
    }

    public Duration getConfiguredRefillPeriod() {
        return configuredRefillPeriod;
    }
}
