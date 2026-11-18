package org.mskcc.cbio.oncokb.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "benchmarking_agreement")
public class BenchmarkingAgreement implements Serializable {

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

    @Column(name = "activation_key")
    private String activationKey;

    @Column(name = "agreement_name")
    private String agreementName;

    @Column(name = "agreement_version")
    private String agreementVersion;

    @Column(name = "acceptance_date")
    private Instant acceptanceDate;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BenchmarkingAgreement)) {
            return false;
        }
        return id != null && id.equals(((BenchmarkingAgreement) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}
