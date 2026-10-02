package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class SuspiciousEmailDomainDTO implements Serializable {

    private Long id;

    @NotBlank
    @Size(max = 255)
    private String domain;

    @NotBlank
    @Size(max = 2000)
    private String justification;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SuspiciousEmailDomainDTO)) {
            return false;
        }

        return id != null && id.equals(((SuspiciousEmailDomainDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "SuspiciousEmailDomainDTO{" +
            "id=" + getId() +
            ", domain='" + getDomain() + "'" +
            ", justification='" + getJustification() + "'" +
            "}";
    }
}
