package org.mskcc.cbio.oncokb.config.application;

/**
 * Configuration for JDBC-backed HTTP sessions, grouped under {@code application.session}. See
 * {@code HttpSessionConfiguration}.
 */
public class SessionProperties {

    // Idle timeout (in seconds) for JDBC-backed HTTP sessions. Defaults to 1 minute.
    // The only need to be long enough for the user to exchange for an API token after
    // being authenticated by Keycloak.
    private int timeoutSeconds = 60;

    // Cron expression for deleting expired JDBC-backed sessions. Defaults to once per minute.
    private String cleanupCron = "0 * * * * *";

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public String getCleanupCron() {
        return cleanupCron;
    }

    public void setCleanupCron(String cleanupCron) {
        this.cleanupCron = cleanupCron;
    }
}
