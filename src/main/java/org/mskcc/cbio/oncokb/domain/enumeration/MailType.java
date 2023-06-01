package org.mskcc.cbio.oncokb.domain.enumeration;

import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;

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
        .fromAddress(EmailAddress.REGISTRATION)
        .titleKey("email.license.clarify.title")
        .stringTemplateName("clarifyLicenseInForProfileCompanyString.txt")
        .modalTitle("For Profit Clarification")
        .blockId(BlockId.FOR_PROFIT_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .category(EmailCategory.CLARIFY)
        .dropdownKey("Send Academic For Profit Email")
        .collapsedNote("Clarified with user on for-profit affiliation")
        .expandedNote("We have sent a clarification email to the user asking why they are applying for the academic license while affiliated with a for-profit company."))
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
        .titleKey("email.active.free.trial.title")
        .actionId(ActionId.GIVE_TRIAL_ACCESS)
        .category(EmailCategory.TRIAL)
        .dropdownKey("Give Trial Access"))
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
        private Optional<String> attachmentFileNames = Optional.empty();
        private Optional<String> titleKey = Optional.of("email.default.title");

        // Below properties for Slack
        private Optional<EmailAddress> fromAddress = Optional.empty();
        // for view modal
        private Optional<String> stringTemplateName = Optional.empty();
        private Optional<String> modalTitle = Optional.empty();
        private Optional<EmailSubject> modalSubject = Optional.of(EmailSubject.DEFAULT);
        // blockId/actionId
        private Optional<BlockId> blockId = Optional.empty();
        private Optional<ActionId> actionId = Optional.empty();
        private Optional<ActionId> confirmActionId = Optional.empty();
        // dropdown section
        private Optional<EmailCategory> category = Optional.empty();
        private Optional<String> dropdownKey = Optional.empty();
        // additional info block
        private Optional<String> collapsedNote = Optional.empty();
        private Optional<String> expandedNote = Optional.empty();

        private MailTypeBuilder templateName(String templateName) {
            this.templateName = templateName;
            return this;
        }

        private MailTypeBuilder description(String description) {
            this.description = description;
            return this;
        }

        private MailTypeBuilder attachmentFileNames(String attachmentFileNames) {
            this.attachmentFileNames = Optional.of(attachmentFileNames);
            return this;
        }

        private MailTypeBuilder fromAddress(EmailAddress fromAddress) {
            this.fromAddress = Optional.of(fromAddress);
            return this;
        }

        private MailTypeBuilder titleKey(String titleKey) {
            this.titleKey = Optional.of(titleKey);
            return this;
        }

        private MailTypeBuilder stringTemplateName(String stringTemplateName) {
            this.stringTemplateName = Optional.of(stringTemplateName);
            return this;
        }

        private MailTypeBuilder modalTitle(String modalTitle) {
            this.modalTitle = Optional.of(modalTitle);
            return this;
        }

        private MailTypeBuilder modalSubject(EmailSubject modalSubject) {
            this.modalSubject = Optional.of(modalSubject);
            return this;
        }

        private MailTypeBuilder blockId(BlockId blockId) {
            this.blockId = Optional.of(blockId);
            return this;
        }

        private MailTypeBuilder actionId(ActionId actionId) {
            this.actionId = Optional.of(actionId);
            return this;
        }

        private MailTypeBuilder confirmActionId(ActionId confirmActionId) {
            this.confirmActionId = Optional.of(confirmActionId);
            return this;
        }

        private MailTypeBuilder category(EmailCategory category) {
            this.category = Optional.of(category);
            return this;
        }

        private MailTypeBuilder dropdownKey(String dropdownKey) {
            this.dropdownKey = Optional.of(dropdownKey);
            return this;
        }

        private MailTypeBuilder collapsedNote(String collapsedNote) {
            this.collapsedNote = Optional.of(collapsedNote);
            return this;
        }

        private MailTypeBuilder expandedNote(String expandedNote) {
            this.expandedNote = Optional.of(expandedNote);
            return this;
        }
    }

    private String templateName;
    private String description;
    private Optional<String> attachmentFileNames;

    // Below properties for Slack
    private Optional<EmailAddress> fromAddress;
    private Optional<String> titleKey;
    // for view modal
    private Optional<String> stringTemplateName;
    private Optional<String> modalTitle;
    private Optional<EmailSubject> modalSubject;
    // blockId
    private Optional<BlockId> blockId;
    private Optional<ActionId> actionId;
    private Optional<ActionId> confirmActionId;
    // dropdown section
    private Optional<EmailCategory> category;
    private Optional<String> dropdownKey;
    // additional info block
    private Optional<String> collapsedNote;
    private Optional<String> expandedNote;

    MailType(MailTypeBuilder builder) {
        this.templateName = builder.templateName;
        this.description = builder.description;
        this.attachmentFileNames = builder.attachmentFileNames;
        this.fromAddress = builder.fromAddress;
        this.titleKey = builder.titleKey;
        this.stringTemplateName = builder.stringTemplateName;
        this.modalTitle = builder.modalTitle;
        this.modalSubject = builder.modalSubject;
        this.blockId = builder.blockId;
        this.actionId = builder.actionId;
        this.confirmActionId = builder.confirmActionId;
        this.category = builder.category;
        this.dropdownKey = builder.dropdownKey;
        this.collapsedNote = builder.collapsedNote;
        this.expandedNote = builder.expandedNote;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getDescription() {
        return description;
    }

    public Optional<String> getAttachmentFileNames() {
        return attachmentFileNames;
    }

    public Optional<String> getStringTemplateName() {
        return stringTemplateName;
    }

    public Optional<EmailAddress> getFromAddress() {
        return fromAddress;
    }

    public Optional<String> getTitleKey() {
        return titleKey;
    }

    public Optional<BlockId> getBlockId() {
        return blockId;
    }

    public Optional<ActionId> getActionId() {
        return actionId;
    }

    public Optional<ActionId> getConfirmActionId() {
        return confirmActionId;
    }

    public Optional<EmailCategory> getCategory() {
        return category;
    }

    public Optional<String> getDropdownKey() {
        return dropdownKey;
    }

    public Optional<String> getModalTitle() {
        return modalTitle;
    }

    public Optional<EmailSubject> getModalSubject() {
        return modalSubject;
    }

    public Optional<String> getCollapsedNote() {
        return collapsedNote;
    }

    public Optional<String> getExpandedNote() {
        return expandedNote;
    }
}
