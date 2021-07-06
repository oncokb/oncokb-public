package org.mskcc.cbio.oncokb.domain;

import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

/**
 * Created by Benjamin Xu on 7/13/21.
 */
public class UserStatusChecks {
    UserDTO userDTO;

    boolean trialAccountActivated;
    boolean trialAccountInitiated;
    boolean academicClarificationEmailSent;

    public UserStatusChecks(UserDTO userDTO, boolean trialAccountActivated, boolean trialAccountInitiated, boolean academicClarificationEmailSent) {
        this.userDTO = userDTO;
        this.trialAccountActivated = trialAccountActivated;
        this.trialAccountInitiated = trialAccountInitiated;
        this.academicClarificationEmailSent = academicClarificationEmailSent;
    }

    public boolean isTrialAccountActivated() { return trialAccountActivated; }

    public void setTrialAccountActivated(boolean trialAccountActivated) { this.trialAccountActivated = trialAccountActivated; }

    public boolean isTrialAccountInitiated() { return trialAccountInitiated; }

    public void setTrialAccountInitiated(boolean trialAccountInitiated) { this.trialAccountInitiated = trialAccountInitiated; }

    public boolean isAcademicClarificationEmailSent() { return academicClarificationEmailSent; }

    public void setAcademicClarificationEmailSent(boolean academicClarificationEmailSent) { this.academicClarificationEmailSent = academicClarificationEmailSent; }

    public boolean isReviewed() {
        return userDTO.isActivated() || trialAccountInitiated || academicClarificationEmailSent;
    }

    public boolean isTrialAccount() { return trialAccountInitiated && (!userDTO.isActivated() || trialAccountActivated); }
}
