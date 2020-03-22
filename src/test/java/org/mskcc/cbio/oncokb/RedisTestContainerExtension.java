
package org.mskcc.cbio.oncokb;

import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.containers.GenericContainer;

import java.util.concurrent.atomic.AtomicBoolean;

public class RedisTestContainerExtension implements BeforeAllCallback {
    private static AtomicBoolean started = new AtomicBoolean(false);

    @Override
    public void beforeAll(ExtensionContext extensionContext) throws Exception {
        if(!started.get()) {
            GenericContainer redis =
                new GenericContainer("redis:5.0.7")
                    .withExposedPorts(6379);
            redis.start();
            System.setProperty("redis.test.server", "redis://" + redis.getContainerIpAddress() + ":" + redis.getMappedPort(6379));
            started.set(true);
        }
    }
}