package org.mskcc.cbio.oncokb.domain;

import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "suspicious_email_domain")
public class SuspiciousEmailDomain implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "domain", nullable = false, unique = true)
    private String domain;

    @NotBlank
    @Column(name = "justification", nullable = false, length = 2000)
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
        if (!(o instanceof SuspiciousEmailDomain)) {
            return false;
        }
        return id != null && id.equals(((SuspiciousEmailDomain) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "SuspiciousEmailDomain{" +
            "id=" + getId() +
            ", domain='" + getDomain() + "'" +
            ", justification='" + getJustification() + "'" +
            "}";
    }
}
