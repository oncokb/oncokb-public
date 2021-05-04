package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

/**
 * Created by Hongxin Zhang on 4/27/21.
 */
public class UserCompany {
    String description;
    Contact businessContact;
    String size;
    String useCase;
    String anticipatedReports;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Contact getBusinessContact() {
        return businessContact;
    }

    public void setBusinessContact(Contact businessContact) {
        this.businessContact = businessContact;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getUseCase() {
        return useCase;
    }

    public void setUseCase(String useCase) {
        this.useCase = useCase;
    }

    public String getAnticipatedReports() {
        return anticipatedReports;
    }

    public void setAnticipatedReports(String anticipatedReports) {
        this.anticipatedReports = anticipatedReports;
    }
}
