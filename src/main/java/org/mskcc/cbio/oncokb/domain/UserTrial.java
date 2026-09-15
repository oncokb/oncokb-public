package org.mskcc.cbio.oncokb.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * A UserTrial.
 */
@Entity
@Table(name = "user_trial")
public class UserTrial implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "initiation_date")
    private Instant initiationDate;

    @Column(name = "initiated_by")
    private String initiatedBy;

    @Column(name = "activation_date")
    private Instant activationDate;

    @Column(name = "activation_key")
    private String activationKey;

    @Column(name = "license_agreement_name")
    private String licenseAgreementName;

    @Column(name = "license_agreement_version")
    private String licenseAgreementVersion;

    @Column(name = "license_agreement_acceptance_date")
    private Instant licenseAgreementAcceptanceDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserTrial)) {
            return false;
        }
        return id != null && id.equals(((UserTrial) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "UserTrial{" +
            "id=" + getId() +
            ", initiationDate='" + getInitiationDate() + "'" +
            ", initiatedBy='" + getInitiatedBy() + "'" +
            ", activationDate='" + getActivationDate() + "'" +
            ", activationKey='" + getActivationKey() + "'" +
            ", licenseAgreementName='" + getLicenseAgreementName() + "'" +
            ", licenseAgreementVersion='" + getLicenseAgreementVersion() + "'" +
            ", licenseAgreementAcceptanceDate='" + getLicenseAgreementAcceptanceDate() + "'" +
            "}";
    }
}
