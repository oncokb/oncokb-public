package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The MailType enumeration.
 */
public enum MailType {
    ACTIVATION("activationEmail", "User Activation", null)
    , APPROVAL("approvalEmail", "User Approval", null)
    , CREATION("creationEmail", "Account Creation", null)
    , PASSWORD_RESET("passwordResetEmail", "Reset Password", null)
    , LICENSE_REVIEW_COMMERCIAL("licenseReview", "License Review - Commercial", null)
    , LICENSE_REVIEW_RESEARCH_COMMERCIAL("licenseReview", "License Review - Research in Commercial", null)
    , LICENSE_REVIEW_HOSPITAL("licenseReview", "License Review - Hospital", null)
    , SEND_INTAKE_FORM_COMMERCIAL("sendIntakeForm", "Send Intake Form - Commercial", "OncoKB_License_Intake_Form_01_23_2020.docx")
    , SEND_INTAKE_FORM_RESEARCH_COMMERCIAL("sendIntakeForm", "Send Intake Form - Research in Commercial", "OncoKB_License_Intake_Form_01_23_2020.docx")
    , SEND_INTAKE_FORM_HOSPITAL("sendIntakeForm", "Send Intake Form - Hospital", "OncoKB_License_Intake_Form_01_23_2020.docx")
    , CLARIFY_ACADEMIC_FOR_PROFIT("clarifyLicenseInForProfileCompany", "Clarify - Requested academic license from a for-profit company", null)
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL("clarifyAcademicUseWithoutInstituteEmail", "Clarify - Requested academic license from a non-institute email", null)
    , VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES("verifyEmailBeforeAccountExpires", "Verify user still owns the email address", null)
    , APPROVAL_MSK_IN_COMMERCIAL("approvalMSKInCommercial", "Autocorrect MSK user license to academic", null)
    , TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE("trialAccountIsAboutToExpire", "Trail account is about to expire", null)
    , TOKEN_HAS_BEEN_EXPOSED("tokenHasBeenExposed", "Token has been exposed", null)
    , TOKEN_HAS_BEEN_EXPOSED_USER("tokenHasBeenExposedToUser", "Token has been exposed", null)
    , SEARCHING_RESPONSE_STRUCTURE_HAS_CHANGED("searchingResponseStructureHasChanged", "Searching Response Structure Has Changed", null)
    , TEST("testEmail", "Test", null)
    ;

    String templateName;
    String description;
    String attachmentFileNames;

    MailType(String templateName, String description, String attachmentFileNames) {
        this.templateName = templateName;
        this.description = description;
        this.attachmentFileNames = attachmentFileNames;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getDescription() {
        return description;
    }

    public String getAttachmentFileNames() {
        return attachmentFileNames;
    }
}
