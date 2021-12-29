package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The MailType enumeration.
 */
public enum MailType {
    ACTIVATION("activationEmail", "User Activation", null)
    , APPROVAL("approvalEmail", "User Approval", null)
    , REJECTION("rejectionEmail", "User Rejection", null)
    , CREATION("creationEmail", "Account Creation", null)
    , PASSWORD_RESET("passwordResetEmail", "Reset Password", null)
    , LICENSE_REVIEW_COMMERCIAL("licenseReview", "License Review - Commercial", null)
    , LICENSE_REVIEW_RESEARCH_COMMERCIAL("licenseReview", "License Review - Research in Commercial", null)
    , LICENSE_REVIEW_HOSPITAL("licenseReview", "License Review - Hospital", null)
    , CLARIFY_ACADEMIC_FOR_PROFIT("clarifyLicenseInForProfileCompany", "Clarify - Requested academic license from a for-profit company", null)
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL("clarifyAcademicUseWithoutInstituteEmail", "Clarify - Requested academic license from a non-institute email", null)
    , CLARIFY_USE_CASE("clarifyUseCase", "Clarify - Use case unclear", null)
    , CLARIFY_DUPLICATE_USER("clarifyDuplicateUser", "Clarify - User registered multiple accounts", null)
    , REJECT_ALUMNI_ADDRESS("alumniEmailAddress", "Reject - Registered under alumni email address", null)
    , VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES("verifyEmailBeforeAccountExpires", "Verify user still owns the email address", null)
    , APPROVAL_ALIGN_LICENSE_WITH_COMPANY("approvalAlignLicenseWithCompanyEmail", "Autocorrect user license to company license", null)
    , TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE("trialAccountIsAboutToExpire", "Trail account is about to expire", null)
    , TRIAL_ACCOUNT_IS_ACTIVATED("trialAccountIsActivated", "Trail Account is Activated", null)
    , ACTIVATE_FREE_TRIAL("activateFreeTrial", "OncoKB Trial Activation Link", null)
    , TOKEN_HAS_BEEN_EXPOSED("tokenHasBeenExposed", "Token has been exposed", null)
    , TOKEN_HAS_BEEN_EXPOSED_USER("tokenHasBeenExposedToUser", "Token has been exposed", null)
    , SEARCHING_RESPONSE_STRUCTURE_HAS_CHANGED("searchingResponseStructureHasChanged", "Searching Response Structure Has Changed", null)
    , LIST_OF_UNAPPROVED_USERS("listOfUnapprovedUsers", "List of unapproved users", null)
    , DATA_USAGE_EXCEEDS_THRESHOLD("dataUsageExceedsThreshold", "Unusual OncoKB account activities (data usage)", null)
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
