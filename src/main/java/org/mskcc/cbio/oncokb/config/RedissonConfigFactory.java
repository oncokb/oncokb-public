package org.mskcc.cbio.oncokb.config;

import org.mskcc.oncokb.meta.enumeration.RedisType;
import org.mskcc.oncokb.meta.model.application.RedisProperties;
import org.redisson.config.Config;

/**
 * Builds a Redisson {@link Config} from a {@link RedisProperties} block. Shared by the data cache
 * ({@link CacheConfiguration}) and the Spring Session store ({@link HttpSessionConfiguration}) so the
 * single/sentinel/cluster wiring lives in one place even though each consumer reads a different
 * {@code application.*-redis} property group and opens its own connection.
 */
public final class RedissonConfigFactory {

    private RedissonConfigFactory() {}

    public static Config createConfig(RedisProperties redis, String clientName) throws Exception {
        Config config = new Config();
        if (redis.getType().equals(RedisType.SINGLE.getType())) {
            config.useSingleServer()
                .setTimeout(redis.getTimeout())
                .setRetryAttempts(redis.getRetryAttempts())
                .setRetryInterval(redis.getRetryInterval())
                .setAddress(redis.getAddress())
                .setPassword(redis.getPassword());
        } else if (redis.getType().equals(RedisType.SENTINEL.getType())) {
            config.useSentinelServers()
                .setTimeout(redis.getTimeout())
                .setRetryAttempts(redis.getRetryAttempts())
                .setRetryInterval(redis.getRetryInterval())
                .setMasterName(redis.getSentinelMasterName())
                .setCheckSentinelsList(false)
                .addSentinelAddress(redis.getAddress())
                .setPassword(redis.getPassword());
        } else if (redis.getType().equals(RedisType.CLUSTER.getType())) {
            config.useClusterServers()
                .setTimeout(redis.getTimeout())
                .setRetryAttempts(redis.getRetryAttempts())
                .setRetryInterval(redis.getRetryInterval())
                .addNodeAddress(redis.getAddress())
                .setPassword(redis.getPassword())
                .setClientName(clientName);
        } else {
            throw new Exception("The redis type " + redis.getType() + " is not supported. Only single, sentinel, and cluster are supported.");
        }
        return config;
    }
}
