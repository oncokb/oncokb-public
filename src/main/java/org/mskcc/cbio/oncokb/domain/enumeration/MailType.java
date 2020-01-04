package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The MailType enumeration.
 */
public enum MailType {
    ACTIVATION("activationEmail", "User Activation")
    , APPROVAL("approvalEmail", "User Approval")
    , CREATION("creationEmail", "Account Creation")
    , PASSWORD_RESET("passwordResetEmail", "Reset Password")
    , LICENSE_REVIEW_COMMERCIAL("licenseReview", "License Review - Commercial")
    , LICENSE_REVIEW_RESEARCH_COMMERCIAL("licenseReview", "Research in Commercial")
    , LICENSE_REVIEW_HOSPITAL("licenseReview", "License Review - Hospital")
    , CLARIFY_ACADEMIC_FOR_PROFIT("clarifyLicenseInForProfileCompany", "Clarify - Requested academic license from a for-profit company")
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL("clarifyAcademicUseWithoutInstituteEmail", "Clarify - Requested academic license from a non-institute email")
    , TEST("testEmail", "Test")
    ;

    String templateName;
    String description;

    MailType(String templateName, String description) {
        this.templateName = templateName;
        this.description = description;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getDescription() {
        return description;
    }
}
