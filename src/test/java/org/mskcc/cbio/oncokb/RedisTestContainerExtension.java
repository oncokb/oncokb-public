
package org.mskcc.cbio.oncokb;

import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;

import java.util.concurrent.atomic.AtomicBoolean;

public class RedisTestContainerExtension implements BeforeAllCallback {

    private static AtomicBoolean started = new AtomicBoolean(false);

    private static GenericContainer redis;

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("jhipster.cache.redis.server", () -> "redis://" + redis.getContainerIpAddress() + ":" + redis.getMappedPort(6379));
    }

    @Override
    public void beforeAll(ExtensionContext extensionContext) throws Exception {
        if (!started.get()) {
            redis = new GenericContainer("redis:6.0.4").withExposedPorts(6379);
            redis.start();
            started.set(true);
        }
    }
}
