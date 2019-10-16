package org.mskcc.cbio.oncokb.config;

import org.springframework.stereotype.Component;

public class PubWebConfiguration {
    String publicWebsiteToken;

    public String getPublicWebsiteToken() {
        return publicWebsiteToken;
    }

    public void setPublicWebsiteToken(String publicWebsiteToken) {
        this.publicWebsiteToken = publicWebsiteToken;
    }
}
