package org.mskcc.cbio.oncokb.web.rest.vm;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;

import java.util.List;

public class RegisteredUsersRequestVM {
    private String query;
    private Boolean emailVerified;
    private List<LicenseType> licenseTypes;
    private List<String> roles;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public List<LicenseType> getLicenseTypes() {
        return licenseTypes;
    }

    public void setLicenseTypes(List<LicenseType> licenseTypes) {
        this.licenseTypes = licenseTypes;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
