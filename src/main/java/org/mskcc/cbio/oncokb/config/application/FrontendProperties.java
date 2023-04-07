package org.mskcc.cbio.oncokb.config.application;

/**
 * Created by Hongxin Zhang on 8/21/20.
 */
public class FrontendProperties {
    private String googleAnalyticsProjectId;
    private String sentryProjectId;
    private String recaptchaProjectId;
    private String recaptchaSiteKey;
    private Float recaptchaThreshold;

    public String getRecaptchaProjectId() {
        return recaptchaProjectId;
    }

    public void setRecaptchaProjectId(String recaptchaProjectId) {
        this.recaptchaProjectId = recaptchaProjectId;
    }

    public Float getRecaptchaThreshold() {
        return recaptchaThreshold;
    }

    public void setRecaptchaThreshold(Float recaptchaThreshold) {
        this.recaptchaThreshold = recaptchaThreshold;
    }

    public void setRecaptchaSiteKey(String recaptchaSiteKey) {
        this.recaptchaSiteKey = recaptchaSiteKey;
    }

    public String getRecaptchaSiteKey() {
        return recaptchaSiteKey;
    }

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
