package org.mskcc.cbio.oncokb.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;

/**
 * A TokenStats.
 */
@Entity
@Table(name = "token_stats")
//@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class TokenStats implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "access_ip")
    private String accessIp;

    @Column(name = "resource")
    private String resource;

    @NotNull
    @Column(name = "access_time", nullable = false)
    private Instant accessTime;

    @NotNull
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount;

    @ManyToOne
    @JsonIgnoreProperties(value = "tokenStats", allowSetters = true)
    private Token token;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccessIp() {
        return accessIp;
    }

    public TokenStats accessIp(String accessIp) {
        this.accessIp = accessIp;
        return this;
    }

    public void setAccessIp(String accessIp) {
        this.accessIp = accessIp;
    }

    public String getResource() {
        return resource;
    }

    public TokenStats resource(String resource) {
        this.resource = resource;
        return this;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public Instant getAccessTime() {
        return accessTime;
    }

    public TokenStats accessTime(Instant accessTime) {
        this.accessTime = accessTime;
        return this;
    }

    public void setAccessTime(Instant accessTime) {
        this.accessTime = accessTime;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public TokenStats usageCount(Integer usageCount) {
        this.usageCount = usageCount;
        return this;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Token getToken() {
        return token;
    }

    public TokenStats token(Token token) {
        this.token = token;
        return this;
    }

    public void setToken(Token token) {
        this.token = token;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TokenStats)) {
            return false;
        }
        return id != null && id.equals(((TokenStats) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TokenStats{" +
            "id=" + getId() +
            ", accessIp='" + getAccessIp() + "'" +
            ", resource='" + getResource() + "'" +
            ", accessTime='" + getAccessTime() + "'" +
            ", usageCount=" + getUsageCount() +
            "}";
    }

    public String toCSV() {
        return getId() +
            ";" + getAccessIp() +
            ";" + getResource() +
            ";" + getAccessTime() +
            ";" + getUsageCount() +
            ";" + getToken().getId();
    }
}
