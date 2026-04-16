package org.mskcc.cbio.oncokb.web.rest.vm;

public class AccountActivationVM {
    private boolean activated;
    private boolean hasGracePeriod;

    public AccountActivationVM(boolean activated, boolean hasGracePeriod) {
        this.activated = activated;
        this.hasGracePeriod = hasGracePeriod;
    }

    public boolean isActivated() {
        return activated;
    }

    public boolean isHasGracePeriod() {
        return hasGracePeriod;
    }
}
