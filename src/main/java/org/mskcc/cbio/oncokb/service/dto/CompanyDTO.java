package org.mskcc.cbio.oncokb.service.dto;

import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.Lob;
import org.mskcc.cbio.oncokb.domain.enumeration.CompanyType;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseModel;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.Company} entity.
 */
public class CompanyDTO implements Serializable {
    
    private Long id;

    @NotNull
    private String name;

    @Lob
    private String description;

    @NotNull
    private CompanyType companyType;

    @NotNull
    private LicenseType licenseType;

    @NotNull
    private LicenseModel licenseModel;

    @NotNull
    private LicenseStatus licenseStatus;

    private String businessContact;

    private String legalContact;

    @NotEmpty
    private Set<String> companyDomains = new HashSet<>();

    private Integer numberOfUsers;
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CompanyType getCompanyType() {
        return companyType;
    }

    public void setCompanyType(CompanyType companyType) {
        this.companyType = companyType;
    }

    public LicenseType getLicenseType() {
        return licenseType;
    }

    public void setLicenseType(LicenseType licenseType) {
        this.licenseType = licenseType;
    }

    public LicenseModel getLicenseModel() {
        return licenseModel;
    }

    public void setLicenseModel(LicenseModel licenseModel) {
        this.licenseModel = licenseModel;
    }

    public LicenseStatus getLicenseStatus() {
        return licenseStatus;
    }

    public void setLicenseStatus(LicenseStatus licenseStatus) {
        this.licenseStatus = licenseStatus;
    }

    public String getBusinessContact() {
        return businessContact;
    }

    public void setBusinessContact(String businessContact) {
        this.businessContact = businessContact;
    }

    public String getLegalContact() {
        return legalContact;
    }

    public void setLegalContact(String legalContact) {
        this.legalContact = legalContact;
    }

    public Set<String> getCompanyDomains() {
        return this.companyDomains;
    }

    public void setCompanyDomains(Set<String> companyDomains) {
        this.companyDomains = companyDomains;
    }

    public Integer getNumberOfUsers() {
        return this.numberOfUsers;
    }

    public void setNumberOfUsers(Integer numberOfUsers) {
        this.numberOfUsers = numberOfUsers;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CompanyDTO)) {
            return false;
        }

        return id != null && id.equals(((CompanyDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CompanyDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", companyType='" + getCompanyType() + "'" +
            ", licenseType='" + getLicenseType() + "'" +
            ", licenseModel='" + getLicenseModel() + "'" +
            ", licenseStatus='" + getLicenseStatus() + "'" +
            ", businessContact='" + getBusinessContact() + "'" +
            ", legalContact='" + getLegalContact() + "'" +
            ", companyDomains='" + getCompanyDomains() + "'" +
            ", numberOfUsers='" + getNumberOfUsers() + "'" +
            "}";
    }
}
