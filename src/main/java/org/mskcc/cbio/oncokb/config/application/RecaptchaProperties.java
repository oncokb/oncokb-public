package org.mskcc.cbio.oncokb.config.application;

public class RecaptchaProperties {
    String recaptchaProjectId;
    String recaptchaSiteKey;
    String recaptchaThreshold;

    public String getRecaptchaProjectId() {
        return recaptchaProjectId;
    }

    public void setRecaptchaProjectId(String recaptchaProjectId) {
        this.recaptchaProjectId = recaptchaProjectId;
    }

    public String getRecaptchaThreshold() {
        return recaptchaThreshold;
    }

    public void setRecaptchaThreshold(String recaptchaThreshold) {
        this.recaptchaThreshold = recaptchaThreshold;
    }

    public void setRecaptchaSiteKey(String recaptchaSiteKey) {
        this.recaptchaSiteKey = recaptchaSiteKey;
    }

    public String getRecaptchaSiteKey() {
        return recaptchaSiteKey;
    }

}
