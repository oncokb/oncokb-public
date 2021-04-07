package org.mskcc.cbio.oncokb.service.dto;

import org.mskcc.cbio.oncokb.service.dto.oncokbcore.TrialAccount;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class AdditionalInfoDTO {
    TrialAccount trialAccount;

    public TrialAccount getTrialAccount() {
        return trialAccount;
    }

    public void setTrialAccount(TrialAccount trialAccount) {
        this.trialAccount = trialAccount;
    }
}
