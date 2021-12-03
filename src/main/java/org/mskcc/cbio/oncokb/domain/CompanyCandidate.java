package org.mskcc.cbio.oncokb.domain;

import java.util.Optional;

/**
 * Created by Calvin Lu on 11/29/2021
 */

public class CompanyCandidate {
    private Optional<Company> companyCandidate;

    private boolean canAssociate = true;
    
    public CompanyCandidate(Optional<Company> company, boolean canAssociate){
        this.companyCandidate = company;
        this.canAssociate = canAssociate;
        if(!company.isPresent()){
            // If the optional is empty, then the company cannot be associated.
            this.canAssociate = false;
        }

    }

    public Optional<Company> getCompanyCandidate() {
        return this.companyCandidate;
    }

    public void setCompanyCandidate(Optional<Company> company) {
        this.companyCandidate = company;
    }

    public boolean getCanAssociate() {
        return this.canAssociate;
    }

    public void setCanAssociate(boolean canAssociate) {
        this.canAssociate = canAssociate;
    }


}
