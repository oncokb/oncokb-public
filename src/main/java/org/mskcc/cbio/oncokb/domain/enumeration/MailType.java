package org.mskcc.cbio.oncokb.domain.enumeration;

import java.util.Optional;

/**
 * The MailType enumeration.
 */
public enum MailType {
    ACTIVATION(new MailTypeBuilder()
        .templateName("activationEmail")
        .description("User Activation"))
    , APPROVAL(new MailTypeBuilder()
        .templateName("approvalEmail")
        .description("User Approval"))
    , REJECTION(new MailTypeBuilder()) //"rejectionEmail", "User Rejection", null)
    , CREATION(new MailTypeBuilder()) //"creationEmail", "Account Creation", null)
    , PASSWORD_RESET(new MailTypeBuilder()) //"passwordResetEmail", "Reset Password", null)
    , LICENSE_REVIEW_COMMERCIAL(new MailTypeBuilder()) //"licenseReview", "License Review - Commercial", null)
    , LICENSE_REVIEW_RESEARCH_COMMERCIAL(new MailTypeBuilder()) //"licenseReview", "License Review - Research in Commercial", null)
    , LICENSE_REVIEW_HOSPITAL(new MailTypeBuilder()) //"licenseReview", "License Review - Hospital", null)
    , CLARIFY_ACADEMIC_FOR_PROFIT(new MailTypeBuilder()
        .templateName("clarifyLicenseInForProfileCompany")
        .description("Clarify - Requested academic license from a for-profit company")
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyLicenseInForProfileCompanyString.txt"))
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL(new MailTypeBuilder()
        .templateName("clarifyAcademicUseWithoutInstituteEmail")
        .description("Clarify - Requested academic license from a non-institute email")) // not complete
    , CLARIFY_USE_CASE(new MailTypeBuilder()) //"clarifyUseCase", "Clarify - Use case unclear", null)
    , CLARIFY_DUPLICATE_USER(new MailTypeBuilder()) //"clarifyDuplicateUser", "Clarify - User registered multiple accounts", null)
    , CLARIFY_REGISTRATION_INFO(new MailTypeBuilder()) //"clarifyRegistrationInfo", "Clarify - Detailed registration info required", null)
    , LICENSE_OPTIONS(new MailTypeBuilder())
    , REJECT_ALUMNI_ADDRESS(new MailTypeBuilder()) //"alumniEmailAddress", "Reject - Registered under alumni email address", null)
    , VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES(new MailTypeBuilder()) //"verifyEmailBeforeAccountExpires", "Verify user still owns the email address", null)
    , APPROVAL_ALIGN_LICENSE_WITH_COMPANY(new MailTypeBuilder()) //"approvalAlignLicenseWithCompanyEmail", "Autocorrect user license to company license", null)
    , TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE(new MailTypeBuilder()) //"trialAccountIsAboutToExpire", "Trail account is about to expire", null)
    , TRIAL_ACCOUNT_IS_ACTIVATED(new MailTypeBuilder()) //"trialAccountIsActivated", "Trail Account is Activated", null)
    , ACTIVATE_FREE_TRIAL(new MailTypeBuilder()
        .templateName("activateFreeTrial")
        .description("OncoKB Trial Activation Link")
        .titleKey("email.active.free.trial.title"))
    , TOKEN_HAS_BEEN_EXPOSED(new MailTypeBuilder()) //"tokenHasBeenExposed", "Token has been exposed", null)
    , TOKEN_HAS_BEEN_EXPOSED_USER(new MailTypeBuilder()) //"tokenHasBeenExposedToUser", "Token has been exposed", null)
    , SEARCHING_RESPONSE_STRUCTURE_HAS_CHANGED(new MailTypeBuilder()) //"searchingResponseStructureHasChanged", "Searching Response Structure Has Changed", null)
    , LIST_OF_UNAPPROVED_USERS(new MailTypeBuilder()) //"listOfUnapprovedUsers", "List of unapproved users", null)
    , DATA_USAGE_EXCEEDS_THRESHOLD(new MailTypeBuilder()) //"dataUsageExceedsThreshold", "Unusual OncoKB account activities (data usage)", null)
    , TEST(new MailTypeBuilder()) //"testEmail", "Test", null)
    ;


    private static class MailTypeBuilder {
        private String templateName;
        private String description;
        private String titleKey = "email.default.title";
        private Optional<String> stringTemplateName = Optional.empty();
        private Optional<String> attachmentFileNames = Optional.empty();

        private MailTypeBuilder templateName(String templateName) {
            this.templateName = templateName;
            return this;
        }

        private MailTypeBuilder description(String description) {
            this.description = description;
            return this;
        }

        private MailTypeBuilder titleKey(String titleKey) {
            this.titleKey = titleKey;
            return this;
        }

        private MailTypeBuilder stringTemplateName(String stringTemplateName){
            this.stringTemplateName = Optional.of(stringTemplateName);
            return this;
        }

        private MailTypeBuilder attachmentFileNames(String attachmentFileNames) {
            this.attachmentFileNames = Optional.of(attachmentFileNames);
            return this;
        }
    }

    private String templateName;
    private String description;
    private String titleKey;
    private Optional<String> stringTemplateName;
    private Optional<String> attachmentFileNames;

    MailType(MailTypeBuilder builder) {
        this.templateName = builder.templateName;
        this.description = builder.description;
        this.titleKey = builder.titleKey;
        this.stringTemplateName = builder.stringTemplateName;
        this.attachmentFileNames = builder.attachmentFileNames;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getDescription() {
        return description;
    }

    public String getTitleKey() {
        return titleKey;
    }

    public Optional<String> getStringTemplateName() {
        return stringTemplateName;
    }

    public Optional<String> getAttachmentFileNames() {
        return attachmentFileNames;
    }
}
