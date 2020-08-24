package org.mskcc.cbio.oncokb.config.application;

/**
 * Created by Hongxin Zhang on 8/21/20.
 */
public class FrontendProperties {
    private String googleAnalyticsProjectId;
    private String sentryProjectId;

    public String getGoogleAnalyticsProjectId() {
        return googleAnalyticsProjectId;
    }

    public void setGoogleAnalyticsProjectId(String googleAnalyticsProjectId) {
        this.googleAnalyticsProjectId = googleAnalyticsProjectId;
    }

    public String getSentryProjectId() {
        return sentryProjectId;
    }

    public void setSentryProjectId(String sentryProjectId) {
        this.sentryProjectId = sentryProjectId;
    }
}
