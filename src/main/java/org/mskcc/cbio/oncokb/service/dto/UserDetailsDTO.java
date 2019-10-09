package org.mskcc.cbio.oncokb.service.dto;
import java.io.Serializable;
import java.util.Objects;
import org.mskcc.cbio.oncokb.domain.enumeration.AccountType;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.UserDetails} entity.
 */
public class UserDetailsDTO implements Serializable {

    private Long id;

    private AccountType accountType;

    private String jobTitle;

    private String company;

    private String city;

    private String country;

    private String address;


    private Long userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
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
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        UserDetailsDTO userDetailsDTO = (UserDetailsDTO) o;
        if (userDetailsDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), userDetailsDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "UserDetailsDTO{" +
            "id=" + getId() +
            ", accountType='" + getAccountType() + "'" +
            ", jobTitle='" + getJobTitle() + "'" +
            ", company='" + getCompany() + "'" +
            ", city='" + getCity() + "'" +
            ", country='" + getCountry() + "'" +
            ", address='" + getAddress() + "'" +
            ", user=" + getUserId() +
            "}";
    }
}
