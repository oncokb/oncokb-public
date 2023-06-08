package org.mskcc.cbio.oncokb.domain.enumeration;

import java.util.Optional;

/**
 * The MailType enumeration.
 */
public enum MailType {
    ACTIVATION(new MailTypeBuilder()
        .templateName("activationEmail")
        .description("User Activation")
        .titleKey("email.activation.title"))
    , CREATION(new MailTypeBuilder()
        .templateName("creationEmail")
        .description("Account Creation")
        .titleKey("email.creation.title"))
    , APPROVAL(new MailTypeBuilder()
        .templateName("approvalEmail")
        .description("User Approval")
        .titleKey("email.approval.title"))
    , APPROVAL_ALIGN_LICENSE_WITH_COMPANY(new MailTypeBuilder()
        .templateName("approvalAlignLicenseWithCompanyEmail")
        .description("Autocorrect user license to company license")
        .titleKey("email.approval.title"))
    , REJECTION(new MailTypeBuilder()
        .templateName("rejectionEmail")
        .description("User Rejection")
        .titleKey("email.reject.title")
        .stringTemplateName("rejectionEmailString.txt)"))
    , REJECT_ALUMNI_ADDRESS(new MailTypeBuilder()
        .templateName("alumniEmailAddress")
        .description("Reject - Registered under alumni email address")
        .titleKey("email.reject.title")
        .stringTemplateName("alumniEmailAddressString.txt"))
    , PASSWORD_RESET(new MailTypeBuilder()
        .templateName("passwordResetEmail")
        .description("Reset Password")
        .titleKey("email.reset.title"))
    , LICENSE_REVIEW_COMMERCIAL(new MailTypeBuilder()
        .templateName("licenseReview")
        .description("License Review - Commercial")
        .titleKey("email.license.review.title"))
    , LICENSE_REVIEW_RESEARCH_COMMERCIAL(new MailTypeBuilder()
        .templateName("licenseReview")
        .description("License Review - Research in Commercial")
        .titleKey("email.license.review.title"))
    , LICENSE_REVIEW_HOSPITAL(new MailTypeBuilder()
        .templateName("licenseReview")
        .description("License Review - Hospital")
        .titleKey("email.license.review.title"))
    , CLARIFY_ACADEMIC_FOR_PROFIT(new MailTypeBuilder()
        .templateName("clarifyLicenseInForProfileCompany")
        .description("Clarify - Requested academic license from a for-profit company")
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyLicenseInForProfileCompanyString.txt"))
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL(new MailTypeBuilder()
        .templateName("clarifyAcademicUseWithoutInstituteEmail")
        .description("Clarify - Requested academic license from a non-institute email")
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyAcademicUseWithoutInstituteEmailString.txt"))
    , CLARIFY_USE_CASE(new MailTypeBuilder()
        .templateName("clarifyUseCase")
        .description("Clarify - Use case unclear")
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyUseCaseString.txt"))
    , CLARIFY_DUPLICATE_USER(new MailTypeBuilder()
        .templateName("clarifyDuplicateUser")
        .description("Clarify - User registered multiple accounts")
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyDuplicateUserString.txt"))
    , CLARIFY_REGISTRATION_INFO(new MailTypeBuilder()
        .templateName("clarifyRegistrationInfo")
        .description("Clarify - Detailed registration info required")
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyRegistrationInfoString.txt"))
    , LICENSE_OPTIONS(new MailTypeBuilder()
        .templateName("licenseOptions")
        .description("Send License Options")
        .titleKey("email.license.options.title")
        .stringTemplateName("licenseOptionsString.txt"))
    , VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES(new MailTypeBuilder()
        .templateName("verifyEmailBeforeAccountExpires")
        .description("Verify user still owns the email address")
        .titleKey("email.account.expires.by.days.title"))
    , ACTIVATE_FREE_TRIAL(new MailTypeBuilder()
        .templateName("activateFreeTrial")
        .description("OncoKB Trial Activation Link")
        .titleKey("email.active.free.trial.title"))
    , TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE(new MailTypeBuilder()
        .templateName("trialAccountIsAboutToExpire")
        .description("Trail account is about to expire"))
    , TRIAL_ACCOUNT_IS_ACTIVATED(new MailTypeBuilder()
        .templateName("trialAccountIsActivated")
        .description("Trail Account is Activated"))
    , DATA_USAGE_EXCEEDS_THRESHOLD(new MailTypeBuilder()
        .templateName("dataUsageExceedsThreshold")
        .description("Unusual OncoKB account activities (data usage)")
        .titleKey("email.unusual.activities.title"))
    , TOKEN_HAS_BEEN_EXPOSED(new MailTypeBuilder()
        .templateName("tokenHasBeenExposed")
        .description("Token has been exposed"))
    , TOKEN_HAS_BEEN_EXPOSED_USER(new MailTypeBuilder()
        .templateName("tokenHasBeenExposedToUser")
        .description("Token has been exposed"))
    , SEARCHING_RESPONSE_STRUCTURE_HAS_CHANGED(new MailTypeBuilder()
        .templateName("searchingResponseStructureHasChanged")
        .description("Searching Response Structure Has Changed"))
    , LIST_OF_UNAPPROVED_USERS(new MailTypeBuilder()
        .templateName("listOfUnapprovedUsers")
        .description("List of unapproved users"))
    , TEST(new MailTypeBuilder()
        .templateName("testEmail")
        .description("Test"))
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
