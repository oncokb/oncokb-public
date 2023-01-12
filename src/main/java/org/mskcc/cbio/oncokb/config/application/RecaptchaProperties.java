package org.mskcc.cbio.oncokb.config.application;

public class RecaptchaProperties {
    String projectId;
    String siteKey;
    float threshold;

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public float getThreshold() {
        return threshold;
    }

    public void setThreshold(float threshold) {
        this.threshold = threshold;
    }

    public void setSiteKey(String siteKey) {
        this.siteKey = siteKey;
    }

    public String getSiteKey() {
        return siteKey;
    }

}
