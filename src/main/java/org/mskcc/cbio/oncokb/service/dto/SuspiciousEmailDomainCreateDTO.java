package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class SuspiciousEmailDomainCreateDTO implements Serializable {

    @NotBlank
    @Size(max = 255)
    private String domain;

    @NotBlank
    @Size(max = 2000)
    private String justification;

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
}
