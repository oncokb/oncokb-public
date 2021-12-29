package org.mskcc.cbio.oncokb.service.dto;

import javax.validation.constraints.*;
import java.io.Serializable;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.CompanyDomain} entity.
 */
public class CompanyDomainDTO implements Serializable {
    
    private Long id;

    @NotNull
    private String name;

    
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CompanyDomainDTO)) {
            return false;
        }

        return id != null && id.equals(((CompanyDomainDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CompanyDomainDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            "}";
    }
}
