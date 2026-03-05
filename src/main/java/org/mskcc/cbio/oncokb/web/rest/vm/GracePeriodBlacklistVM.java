package org.mskcc.cbio.oncokb.web.rest.vm;

import java.util.Set;

public class GracePeriodBlacklistVM {

    private Set<String> domains;

    public GracePeriodBlacklistVM() {
    }

    public GracePeriodBlacklistVM(Set<String> domains) {
        this.domains = domains;
    }

    public Set<String> getDomains() {
        return domains;
    }

    public void setDomains(Set<String> domains) {
        this.domains = domains;
    }
}
