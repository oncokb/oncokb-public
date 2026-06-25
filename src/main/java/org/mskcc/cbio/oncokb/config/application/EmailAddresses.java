package org.mskcc.cbio.oncokb.config.application;

/**
 * Created by Hongxin Zhang on 3/27/20.
 */
public class EmailAddresses {
    private String licenseAddress;
    private String registrationAddress;
    private String contactAddress;
    private String techDevAddress;

    public String getLicenseAddress() {
        return licenseAddress;
    }

    public void setLicenseAddress(String licenseAddress) {
        this.licenseAddress = licenseAddress;
    }

    public String getRegistrationAddress() {
        return registrationAddress;
    }

    public void setRegistrationAddress(String registrationAddress) {
        this.registrationAddress = registrationAddress;
    }

    public String getContactAddress() {
        return contactAddress;
    }

    public void setContactAddress(String contactAddress) {
        this.contactAddress = contactAddress;
    }

    public String getTechDevAddress() {
        return techDevAddress;
    }

    public void setTechDevAddress(String techDevAddress) {
        this.techDevAddress = techDevAddress;
    }
}
