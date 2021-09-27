package org.mskcc.cbio.oncokb.domain;


import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;

import org.mskcc.cbio.oncokb.domain.enumeration.CompanyType;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;

/**
 * A Company.
 */
@Entity
@Table(name = "company")
public class Company implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "company_type", nullable = false)
    private CompanyType companyType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "license_type", nullable = false)
    private LicenseType licenseType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "license_status", nullable = false)
    private LicenseStatus licenseStatus;

    @Column(name = "business_contact")
    private String businessContact;

    @Column(name = "legal_contact")
    private String legalContact;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Company name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public Company description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CompanyType getCompanyType() {
        return companyType;
    }

    public Company companyType(CompanyType companyType) {
        this.companyType = companyType;
        return this;
    }

    public void setCompanyType(CompanyType companyType) {
        this.companyType = companyType;
    }

    public LicenseType getLicenseType() {
        return licenseType;
    }

    public Company licenseType(LicenseType licenseType) {
        this.licenseType = licenseType;
        return this;
    }

    public void setLicenseType(LicenseType licenseType) {
        this.licenseType = licenseType;
    }

    public LicenseStatus getLicenseStatus() {
        return licenseStatus;
    }

    public Company licenseStatus(LicenseStatus licenseStatus) {
        this.licenseStatus = licenseStatus;
        return this;
    }

    public void setLicenseStatus(LicenseStatus licenseStatus) {
        this.licenseStatus = licenseStatus;
    }

    public String getBusinessContact() {
        return businessContact;
    }

    public Company businessContact(String businessContact) {
        this.businessContact = businessContact;
        return this;
    }

    public void setBusinessContact(String businessContact) {
        this.businessContact = businessContact;
    }

    public String getLegalContact() {
        return legalContact;
    }

    public Company legalContact(String legalContact) {
        this.legalContact = legalContact;
        return this;
    }

    public void setLegalContact(String legalContact) {
        this.legalContact = legalContact;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Company)) {
            return false;
        }
        return id != null && id.equals(((Company) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Company{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", companyType='" + getCompanyType() + "'" +
            ", licenseType='" + getLicenseType() + "'" +
            ", licenseStatus='" + getLicenseStatus() + "'" +
            ", businessContact='" + getBusinessContact() + "'" +
            ", legalContact='" + getLegalContact() + "'" +
            "}";
    }
}
