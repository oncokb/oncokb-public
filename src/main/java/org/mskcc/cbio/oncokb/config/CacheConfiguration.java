package org.mskcc.cbio.oncokb.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;
import org.redisson.Redisson;
import org.redisson.config.Config;
import org.redisson.jcache.configuration.RedissonConfiguration;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
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
    public javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration(JHipsterProperties jHipsterProperties, ApplicationProperties applicationProperties) {
        MutableConfiguration<Object, Object> jcacheConfig = new MutableConfiguration<>();
        Config config = new Config();
        config.useSingleServer()
            .setAddress(jHipsterProperties.getCache().getRedis().getServer())
            .setPassword(applicationProperties.getRedisPassword());
        jcacheConfig.setStatisticsEnabled(true);
        jcacheConfig.setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(new Duration(TimeUnit.SECONDS, jHipsterProperties.getCache().getRedis().getExpiration())));
        return RedissonConfiguration.fromInstance(Redisson.create(config), jcacheConfig);
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cm) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cm);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer(javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration) {
        return cm -> {
            createCache(cm, org.mskcc.cbio.oncokb.repository.UserRepository.USERS_BY_LOGIN_CACHE, jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.repository.UserRepository.USERS_BY_EMAIL_CACHE, jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.User.class.getName(), jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.Authority.class.getName(), jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.UserDetails.class.getName(), jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.Token.class.getName(), jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.TokenStats.class.getName(), jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            // jhipster-needle-redis-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName, javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cm.destroyCache(cacheName);
        }
        cm.createCache(cacheName, jcacheConfiguration);
    }

}
