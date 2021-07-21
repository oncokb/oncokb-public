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
    boolean academicForProfitEmailSent;
    boolean academicClarificationEmailSent;
    boolean clarifyUseCaseEmailSent;
    boolean rejectionEmailSent;

    public UserStatusChecks(UserDTO userDTO, boolean trialAccountActivated, boolean trialAccountInitiated, boolean academicForProfitEmailSent, boolean academicClarificationEmailSent, boolean clarifyUseCaseEmailSent, boolean rejectionEmailSent) {
        this.userDTO = userDTO;
        this.trialAccountActivated = trialAccountActivated;
        this.trialAccountInitiated = trialAccountInitiated;
        this.academicForProfitEmailSent = academicForProfitEmailSent;
        this.academicClarificationEmailSent = academicClarificationEmailSent;
        this.clarifyUseCaseEmailSent = clarifyUseCaseEmailSent;
        this.rejectionEmailSent = rejectionEmailSent;
    }

    public UserStatusChecks(UserDTO userDTO, boolean newUserActivation, UserService userService, SlackService slackService) {
        this.userDTO = userDTO;
        trialAccountActivated = userService.trialAccountActivated(userDTO);
        trialAccountInitiated = userService.trialAccountInitiated(userDTO);
        academicForProfitEmailSent = slackService.withForProfitClarificationNote(userDTO);
        academicClarificationEmailSent = slackService.withAcademicClarificationNote(userDTO, newUserActivation);
        clarifyUseCaseEmailSent = slackService.withUseCaseClarificationNote(userDTO);
        rejectionEmailSent = slackService.withRejectionNote(userDTO);
    }

    public boolean isTrialAccountActivated() { return trialAccountActivated; }

    public void setTrialAccountActivated(boolean trialAccountActivated) { this.trialAccountActivated = trialAccountActivated; }

    public boolean isTrialAccountInitiated() { return trialAccountInitiated; }

    public void setTrialAccountInitiated(boolean trialAccountInitiated) { this.trialAccountInitiated = trialAccountInitiated; }

    public boolean isAcademicForProfitEmailSent() { return academicForProfitEmailSent; }

    public void setAcademicForProfitEmailSent(boolean academicForProfitEmailSent) { this.academicForProfitEmailSent = academicForProfitEmailSent; }

    public boolean isAcademicClarificationEmailSent() { return academicClarificationEmailSent; }

    public void setAcademicClarificationEmailSent(boolean academicClarificationEmailSent) { this.academicClarificationEmailSent = academicClarificationEmailSent; }

    public boolean isClarifyUseCaseEmailSent() { return clarifyUseCaseEmailSent; }

    public void setClarifyUseCaseEmailSent(boolean clarifyUseCaseEmailSent) { this.clarifyUseCaseEmailSent = clarifyUseCaseEmailSent; }

    public boolean isRejectionEmailSent() { return rejectionEmailSent; }

    public void setRejectionEmailSent(boolean rejectionEmailSent) { this.rejectionEmailSent = rejectionEmailSent; }

    public boolean isReviewed() {
        return userDTO.isActivated()
            || trialAccountInitiated
            || academicForProfitEmailSent
            || academicClarificationEmailSent
            || clarifyUseCaseEmailSent
            || rejectionEmailSent;
    }

    public boolean isTrialAccount() { return trialAccountInitiated && (!userDTO.isActivated() || trialAccountActivated); }
}
