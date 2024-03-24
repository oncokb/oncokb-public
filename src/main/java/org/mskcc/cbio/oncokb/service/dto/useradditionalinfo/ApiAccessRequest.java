package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

import java.io.Serializable;

import javax.validation.constraints.NotEmpty;

public class ApiAccessRequest implements Serializable {

    boolean isRequested;

    @NotEmpty String justification;

    public boolean isRequested() {
        return isRequested;
    }

    public void setRequested(boolean isRequested) {
        this.isRequested = isRequested;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }
}