package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.config.annotation.web.http.JdbcHttpSessionConfiguration;

/**
 * Persists HTTP sessions in the primary application database so authenticated OAuth sessions survive
 * pod restarts and are shared across instances.
 */
@Configuration
public class HttpSessionConfiguration extends JdbcHttpSessionConfiguration {

    public HttpSessionConfiguration(ApplicationProperties applicationProperties) {
        setMaxInactiveIntervalInSeconds(applicationProperties.getSession().getTimeoutSeconds());
        setCleanupCron(applicationProperties.getSession().getCleanupCron());
    }
}
