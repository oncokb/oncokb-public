package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import javax.persistence.Lob;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.UserDetails} entity.
 */
public class UserDetailsDTO implements Serializable {

    private Long id;

    private LicenseType licenseType;

    private String jobTitle;

    private String company;

    private String city;

    private String country;

    private String address;

    @Lob
    private AdditionalInfoDTO additionalInfo;

    private Long userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LicenseType getLicenseType() {
        return licenseType;
    }

    public void setLicenseType(LicenseType licenseType) {
        this.licenseType = licenseType;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public AdditionalInfoDTO getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(AdditionalInfoDTO additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserDetailsDTO)) {
            return false;
        }

        return id != null && id.equals(((UserDetailsDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserDetailsDTO{" +
            "id=" + getId() +
            ", licenseType='" + getLicenseType() + "'" +
            ", jobTitle='" + getJobTitle() + "'" +
            ", company='" + getCompany() + "'" +
            ", city='" + getCity() + "'" +
            ", country='" + getCountry() + "'" +
            ", address='" + getAddress() + "'" +
            ", additionalInfo='" + getAdditionalInfo() + "'" +
            ", userId=" + getUserId() +
            "}";
    }
}
