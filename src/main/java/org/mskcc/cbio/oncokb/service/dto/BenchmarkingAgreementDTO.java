package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class BenchmarkingAgreementDTO implements Serializable {
    private Long id;

    private Long userId;

    private Instant initiationDate;

    private String initiatedBy;

    private String activationKey;

    private String agreementName;

    private String agreementVersion;

    private Instant acceptanceDate;

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

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public String getAgreementName() {
        return agreementName;
    }

    public void setAgreementName(String agreementName) {
        this.agreementName = agreementName;
    }

    public String getAgreementVersion() {
        return agreementVersion;
    }

    public void setAgreementVersion(String agreementVersion) {
        this.agreementVersion = agreementVersion;
    }

    public Instant getAcceptanceDate() {
        return acceptanceDate;
    }

    public void setAcceptanceDate(Instant acceptanceDate) {
        this.acceptanceDate = acceptanceDate;
    }
}
