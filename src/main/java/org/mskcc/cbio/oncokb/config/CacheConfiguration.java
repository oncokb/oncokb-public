package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.RedisType;
import org.springframework.cache.annotation.EnableCaching;
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
    public javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration(JHipsterProperties jHipsterProperties, ApplicationProperties applicationProperties) throws Exception {
        MutableConfiguration<Object, Object> jcacheConfig = new MutableConfiguration<>();
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
            createCache(cm, org.mskcc.cbio.oncokb.repository.TokenRepository.TOKEN_BY_UUID_CACHE, jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.repository.TokenRepository.TOKENS_BY_USER_CACHE, jcacheConfiguration);
//            createCache(cm, org.mskcc.cbio.oncokb.domain.TokenStats.class.getName(), jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            createCache(cm, org.mskcc.cbio.oncokb.domain.UserMails.class.getName(), jcacheConfiguration);
            // jhipster-needle-redis-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName, javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache == null) {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }

}
