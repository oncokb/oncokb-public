package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class AdditionalInfoDTO implements Serializable{
    TrialAccount trialAccount;

    UserCompany userCompany;

    ApiAccessRequest apiAccessRequest;

    public AdditionalInfoDTO() {

    }

    public TrialAccount getTrialAccount() {
        return trialAccount;
    }

    public void setTrialAccount(TrialAccount trialAccount) {
        this.trialAccount = trialAccount;
    }

    public UserCompany getUserCompany() {
        return userCompany;
    }

    public void setUserCompany(UserCompany userCompany) {
        this.userCompany = userCompany;
    }

    public ApiAccessRequest getApiAccessRequest() {
        return apiAccessRequest;
    }

    public void setApiAccessRequest(ApiAccessRequest apiAccessRequest) {
        this.apiAccessRequest = apiAccessRequest;
    }

}
