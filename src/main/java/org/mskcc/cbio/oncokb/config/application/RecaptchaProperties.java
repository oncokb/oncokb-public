package org.mskcc.cbio.oncokb.config.application;

public class RecaptchaProperties {
    String recaptchaProjectId;
    String recaptchaSiteKey;
    Long recaptchaThreshold;

    public String getRecaptchaProjectId() {
        return recaptchaProjectId;
    }

    public void setRecaptchaProjectId(String recaptchaProjectId) {
        this.recaptchaProjectId = recaptchaProjectId;
    }

    public Long getRecaptchaThreshold() {
        return recaptchaThreshold;
    }

    public void setRecaptchaThreshold(Long recaptchaThreshold) {
        this.recaptchaThreshold = recaptchaThreshold;
    }

    public void setRecaptchaSiteKey(String recaptchaSiteKey) {
        this.recaptchaSiteKey = recaptchaSiteKey;
    }

    public String getRecaptchaSiteKey() {
        return recaptchaSiteKey;
    }

}
