package org.mskcc.cbio.oncokb.web.rest.vm;

import javax.validation.constraints.NotNull;

public class VerifyCompanyNameVM {

    @NotNull
    private String name;

    private Long companyId;

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCompanyId() {
        return this.companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

}
