package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.RedisType;
import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.mskcc.cbio.oncokb.config.cache.CompanyCacheResolver;
import org.mskcc.cbio.oncokb.config.cache.TokenCacheResolver;
import org.mskcc.cbio.oncokb.config.cache.UserCacheResolver;
import org.redisson.api.RedissonClient;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.redisson.Redisson;
import org.redisson.config.Config;
import org.redisson.jcache.configuration.RedissonConfiguration;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.cache.interceptor.CacheResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.hibernate.cache.jcache.ConfigSettings;

import java.util.concurrent.TimeUnit;

import javax.cache.configuration.MutableConfiguration;
import javax.cache.expiry.CreatedExpiryPolicy;
import javax.cache.expiry.Duration;

import io.github.jhipster.config.JHipsterProperties;

@Configuration
@EnableCaching
public class CacheConfiguration {
    @Bean
    public RedissonClient redissonClient(ApplicationProperties applicationProperties) throws Exception {
        Config config = new Config();
        if (applicationProperties.getRedis().getType().equals(RedisType.SINGLE.getType())) {
            config.useSingleServer()
                .setAddress(applicationProperties.getRedis().getAddress())
                .setPassword(applicationProperties.getRedis().getPassword());
        } else if (applicationProperties.getRedis().getType().equals(RedisType.SENTINEL.getType())) {
            config.useSentinelServers()
                .setMasterName(applicationProperties.getRedis().getSentinelMasterName())
                .setCheckSentinelsList(false)
                .addSentinelAddress(
                    applicationProperties
                        .getRedis()
                        .getAddress()
                )
                .setPassword(applicationProperties.getRedis().getPassword());
        } else {
            throw new Exception("The redis type " + applicationProperties.getRedis().getType() + " is not supported. Only single and master-slave are supported.");
        }
        return Redisson.create(config);
    }

    @Bean
    public javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration(JHipsterProperties jHipsterProperties, RedissonClient redissonClient) {
        MutableConfiguration<Object, Object> jcacheConfig = new MutableConfiguration<>();
        jcacheConfig.setStatisticsEnabled(true);
        jcacheConfig.setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(new Duration(TimeUnit.SECONDS, jHipsterProperties.getCache().getRedis().getExpiration())));
        return RedissonConfiguration.fromInstance(redissonClient, jcacheConfig);
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cm) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cm);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer(javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration, CacheNameResolver cacheNameResolver, ApplicationProperties applicationProperties) {
        return cm -> {
            createCache(cm, org.mskcc.cbio.oncokb.config.cache.UserCacheResolver.USERS_BY_LOGIN_CACHE, jcacheConfiguration, cacheNameResolver);
            createCache(cm, org.mskcc.cbio.oncokb.config.cache.UserCacheResolver.USERS_BY_EMAIL_CACHE, jcacheConfiguration, cacheNameResolver);

            createCache(cm, org.mskcc.cbio.oncokb.config.cache.TokenCacheResolver.TOKEN_BY_UUID_CACHE, jcacheConfiguration, cacheNameResolver);
            createCache(cm, org.mskcc.cbio.oncokb.config.cache.TokenCacheResolver.TOKENS_BY_USER_LOGIN_CACHE, jcacheConfiguration, cacheNameResolver);

            createCache(cm, org.mskcc.cbio.oncokb.config.cache.CompanyCacheResolver.COMPANIES_BY_ID_CACHE, jcacheConfiguration, cacheNameResolver);
            createCache(cm, org.mskcc.cbio.oncokb.config.cache.CompanyCacheResolver.COMPANIES_BY_NAME_CACHE, jcacheConfiguration, cacheNameResolver);
            // jhipster-needle-redis-add-entry
        };
    }

    @Bean
    public CacheResolver tokenCacheResolver(CacheManager cm, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        return new TokenCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    @Bean
    public CacheResolver userCacheResolver(CacheManager cm, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        return new UserCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    @Bean
    public CacheResolver companyCacheResolver(CacheManager cm, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        return new CompanyCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName, javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration, CacheNameResolver cacheNameResolver) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache == null) {
            cm.createCache(cacheNameResolver.getCacheName(cacheName), jcacheConfiguration);
        }
    }

}
