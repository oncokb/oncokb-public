package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class AdditionalInfoDTO {
    TrialAccount trialAccount;

    UserCompany userCompany;

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
}
