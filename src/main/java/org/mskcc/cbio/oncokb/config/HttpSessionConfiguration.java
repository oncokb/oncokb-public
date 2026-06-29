package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.oncokb.meta.enumeration.RedisType;
import org.mskcc.oncokb.meta.model.application.RedisProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisNode;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisSentinelConfiguration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.session.data.redis.config.annotation.SpringSessionRedisConnectionFactory;
import org.springframework.session.data.redis.config.annotation.web.http.RedisHttpSessionConfiguration;

import java.net.URI;
import java.time.Duration;

/**
 * Persists HTTP sessions in Redis so authenticated OAuth sessions survive pod restarts and are shared
 * across instances.
 *
 * <p>This uses Spring Session's Redis repository instead of Redisson's session repository. Redisson is
 * still used separately by {@link CacheConfiguration} for application data caching/rate-limit plumbing.
 */
@Configuration
@ConditionalOnProperty(prefix = "application.session.redis", name = "enabled", havingValue = "true")
public class HttpSessionConfiguration extends RedisHttpSessionConfiguration {

    public HttpSessionConfiguration(ApplicationProperties applicationProperties) {
        setMaxInactiveIntervalInSeconds(applicationProperties.getSession().getTimeoutSeconds());
        setRedisNamespace(SessionPrincipalIndexCleanup.getSessionNamespace(applicationProperties));
    }

    @Bean
    @SpringSessionRedisConnectionFactory
    public LettuceConnectionFactory springSessionRedisConnectionFactory(ApplicationProperties applicationProperties) {
        RedisProperties redis = applicationProperties.getSession().getRedis();
        LettuceClientConfiguration clientConfiguration = LettuceClientConfiguration.builder()
            .commandTimeout(Duration.ofMillis(redis.getTimeout()))
            .build();

        if (RedisType.SINGLE.getType().equals(redis.getType())) {
            return new LettuceConnectionFactory(createStandaloneConfiguration(redis), clientConfiguration);
        } else if (RedisType.SENTINEL.getType().equals(redis.getType())) {
            return new LettuceConnectionFactory(createSentinelConfiguration(redis), clientConfiguration);
        } else if (RedisType.CLUSTER.getType().equals(redis.getType())) {
            return new LettuceConnectionFactory(createClusterConfiguration(redis), clientConfiguration);
        }

        throw new IllegalArgumentException("The redis type " + redis.getType() + " is not supported. Only single, sentinel, and cluster are supported.");
    }

    private RedisStandaloneConfiguration createStandaloneConfiguration(RedisProperties redis) {
        RedisNode node = parseRedisNode(redis.getAddress());
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration(node.getHost(), node.getPort());
        configuration.setPassword(RedisPassword.of(redis.getPassword()));
        return configuration;
    }

    private RedisSentinelConfiguration createSentinelConfiguration(RedisProperties redis) {
        RedisNode node = parseRedisNode(redis.getAddress());
        RedisSentinelConfiguration configuration = new RedisSentinelConfiguration();
        configuration.master(redis.getSentinelMasterName());
        configuration.sentinel(node.getHost(), node.getPort());
        configuration.setPassword(RedisPassword.of(redis.getPassword()));
        return configuration;
    }

    private RedisClusterConfiguration createClusterConfiguration(RedisProperties redis) {
        RedisNode node = parseRedisNode(redis.getAddress());
        RedisClusterConfiguration configuration = new RedisClusterConfiguration();
        configuration.addClusterNode(node);
        configuration.setPassword(RedisPassword.of(redis.getPassword()));
        return configuration;
    }

    private RedisNode parseRedisNode(String address) {
        URI uri = URI.create(address);
        return new RedisNode(uri.getHost(), uri.getPort());
    }
}
