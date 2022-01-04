package org.mskcc.cbio.oncokb.web.rest.vm;

import java.util.List;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

public class CompanyVM extends CompanyDTO {
    private List<String> companyUserEmails;
    
    public CompanyVM() {
    }

    public List<String> getCompanyUserEmails() {
        return this.companyUserEmails;
    }

    public void setCompanyUserEmails(List<String> companyUserEmails) {
        this.companyUserEmails = companyUserEmails;
    }
    
}
