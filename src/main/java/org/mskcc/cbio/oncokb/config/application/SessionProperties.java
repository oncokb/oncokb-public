package org.mskcc.cbio.oncokb.config.application;

import org.mskcc.oncokb.meta.model.application.RedisProperties;

/**
 * Configuration for Redis-backed HTTP sessions, grouped under {@code application.session}. See
 * {@code HttpSessionConfiguration}.
 *
 * <p>The {@code redis} connection here is intentionally separate from the data-cache
 * {@code application.redis}: the two serve different purposes and are enabled independently.
 */
public class SessionProperties {

    // Idle timeout (in seconds) for Redis-backed HTTP sessions. Defaults to 10 minutes.
    private int timeoutSeconds = 600;

    // Redis used to persist HTTP sessions; only applies when redis.enabled is true.
    private RedisProperties redis;

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public RedisProperties getRedis() {
        return redis;
    }

    public void setRedis(RedisProperties redis) {
        this.redis = redis;
    }
}
