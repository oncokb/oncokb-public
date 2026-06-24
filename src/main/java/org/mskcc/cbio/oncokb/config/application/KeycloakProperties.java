package org.mskcc.cbio.oncokb.config.application;

public class KeycloakProperties {

    private Boolean enabled = false;
    private String allowedEmailDomain = "mskcc.org";

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public String getAllowedEmailDomain() {
        return allowedEmailDomain;
    }

    public void setAllowedEmailDomain(String allowedEmailDomain) {
        this.allowedEmailDomain = allowedEmailDomain;
    }
}
