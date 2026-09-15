package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import java.time.Instant;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.UserTrial} entity.
 */
public class UserTrialDTO implements Serializable {

    private Long id;

    private Long userId;

    private Instant initiationDate;

    private String initiatedBy;

    private Instant activationDate;

    private String activationKey;

    private String licenseAgreementName;

    private String licenseAgreementVersion;

    private Instant licenseAgreementAcceptanceDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Instant getInitiationDate() {
        return initiationDate;
    }

    public void setInitiationDate(Instant initiationDate) {
        this.initiationDate = initiationDate;
    }

    public String getInitiatedBy() {
        return initiatedBy;
    }

    public void setInitiatedBy(String initiatedBy) {
        this.initiatedBy = initiatedBy;
    }

    public Instant getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(Instant activationDate) {
        this.activationDate = activationDate;
    }

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public String getLicenseAgreementName() {
        return licenseAgreementName;
    }

    public void setLicenseAgreementName(String licenseAgreementName) {
        this.licenseAgreementName = licenseAgreementName;
    }

    public String getLicenseAgreementVersion() {
        return licenseAgreementVersion;
    }

    public void setLicenseAgreementVersion(String licenseAgreementVersion) {
        this.licenseAgreementVersion = licenseAgreementVersion;
    }

    public Instant getLicenseAgreementAcceptanceDate() {
        return licenseAgreementAcceptanceDate;
    }

    public void setLicenseAgreementAcceptanceDate(Instant licenseAgreementAcceptanceDate) {
        this.licenseAgreementAcceptanceDate = licenseAgreementAcceptanceDate;
    }
}
