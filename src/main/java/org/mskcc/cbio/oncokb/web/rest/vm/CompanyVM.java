package org.mskcc.cbio.oncokb.web.rest.vm;

import java.util.List;

import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;

public class CompanyVM extends CompanyDTO {

    private List<String> companyDomains;
    
    public CompanyVM(){

    }

    public List<String> getCompanyDomains() {
        return this.companyDomains;
    }

    public void setCompanyDomains(List<String> companyDomains) {
        this.companyDomains = companyDomains;
    }


}
