package org.mskcc.cbio.oncokb.web.rest.vm;

import java.util.List;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

public class CompanyVM extends CompanyDTO {
    private List<UserDTO> companyUserDTOs;
    
    public CompanyVM() {
    }
    
    public List<UserDTO> getCompanyUserDTOs() {
        return this.companyUserDTOs;
    }
    
    public void setCompanyUserDTOs(List<UserDTO> companyUserDTOs) {
        this.companyUserDTOs = companyUserDTOs;
    }
}
