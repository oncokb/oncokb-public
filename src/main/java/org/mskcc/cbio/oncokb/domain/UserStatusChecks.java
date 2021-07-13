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
    boolean embargoEmailSent;

    public UserStatusChecks(UserDTO userDTO, UserService userService, SlackService slackService) {
        this.userDTO = userDTO;
        trialAccountActivated = userService.isTrialAccountActivated(userDTO);
        trialAccountInitiated = userService.trialAccountInitiated(userDTO);
        academicClarificationEmailSent = slackService.withClarificationNote(userDTO, false, false);
        embargoEmailSent = slackService.withEmbargoNote(userDTO);
    }

    public boolean isTrialAccountActivated() { return trialAccountActivated; }

    public void setTrialAccountActivated(boolean trialAccountActivated) { this.trialAccountActivated = trialAccountActivated; }

    public boolean isTrialAccountInitiated() { return trialAccountInitiated; }

    public void setTrialAccountInitiated(boolean trialAccountInitiated) { this.trialAccountInitiated = trialAccountInitiated; }

    public boolean isAcademicClarificationEmailSent() { return academicClarificationEmailSent; }

    public void setAcademicClarificationEmailSent(boolean academicClarificationEmailSent) { this.academicClarificationEmailSent = academicClarificationEmailSent; }

    public boolean isEmbargoEmailSent() { return embargoEmailSent; }

    public void setEmbargoEmailSent(boolean embargoEmailSent) { this.embargoEmailSent = embargoEmailSent; }

    public boolean isReviewed() {
        return trialAccountInitiated || academicClarificationEmailSent || embargoEmailSent;
    }

    public boolean isTrialAccount() { return trialAccountInitiated && (!userDTO.isActivated() || trialAccountActivated); }
}
