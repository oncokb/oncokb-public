package org.mskcc.cbio.oncokb.web.rest.slack;

import org.mskcc.cbio.oncokb.domain.enumeration.EmailCategory;
import org.mskcc.cbio.oncokb.domain.enumeration.EmailSubject;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * The SlackOption enumeration. This enum is for all the options
 * the team can select for a license request in the Slack channel.
 *
 * Approval is not included as the logic is complex and unique.
 */
public enum DropdownEmailOption {
    GIVE_TRIAL_ACCESS(new DropdownEmailOptionBuilder()
        .blockId(BlockId.TRIAL_ACCOUNT_NOTE)
        .actionId(ActionId.GIVE_TRIAL_ACCESS)
        .mailType(MailType.ACTIVATE_FREE_TRIAL)
        .category(EmailCategory.TRIAL)
        .dropdownKey("Give Trial Access")
        .isNotModalEmail()
        .expandedNote("The trial account has been initialized and notified."))
    , CLARIFY_ACADEMIC_FOR_PROFIT(new DropdownEmailOptionBuilder()
        .blockId(BlockId.FOR_PROFIT_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .mailType(MailType.CLARIFY_ACADEMIC_FOR_PROFIT)
        .category(EmailCategory.CLARIFY)
        .specificLicense(LicenseType.ACADEMIC)
        .dropdownKey("Send Academic For Profit Email")
        .modalTitle("For Profit Clarification")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on for-profit affiliation")
        .expandedNote("We have sent a clarification email to the user asking why they are applying for the academic license while affiliated with a for-profit company."))
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL(new DropdownEmailOptionBuilder()
        .blockId(BlockId.ACADEMIC_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_ACADEMIC_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL)
        .category(EmailCategory.CLARIFY)
        .specificLicense(LicenseType.ACADEMIC)
        .dropdownKey("Send Academic Domain Clarification Email")
        .modalTitle("Domain Clarification")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on noninstitutional email")
        .expandedNote("We have sent a clarification email to the user asking why they could not use an institution email to register."))
    , CLARIFY_USE_CASE(new DropdownEmailOptionBuilder()
        .blockId(BlockId.USE_CASE_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_USE_CASE_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_USE_CASE_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_USE_CASE)
        .category(EmailCategory.CLARIFY)
        .dropdownKey("Send Use Case Clarification Email")
        .modalTitle("Use Case Clarification")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Sent use case clarification")
        .expandedNote("We have sent a clarification email to the user asking to further explain their use case."))
    , CLARIFY_DUPLICATE_USER(new DropdownEmailOptionBuilder()
        .blockId(BlockId.DUPLICATE_USER_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_DUPLICATE_USER_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_DUPLICATE_USER_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_DUPLICATE_USER)
        .category(EmailCategory.CLARIFY)
        .dropdownKey("Send Duplicate User Email")
        .modalTitle("Clarify Duplicate User")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on multiple account requests")
        .expandedNote("We have sent a clarification email to the user asking why they registered multiple accounts."))
    , CLARIFY_REGISTRATION_INFO(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REGISTRATION_INFO_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_REGISTRATION_INFO_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REGISTRATION_INFO_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_REGISTRATION_INFO)
        .category(EmailCategory.CLARIFY)
        .dropdownKey("Send Registration Info Clarification Email")
        .modalTitle("Clarify Registry Info")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on registration info")
        .expandedNote("We have sent a clarification email to the user asking to provide more detailed registration info."))
    , LICENSE_OPTIONS(new DropdownEmailOptionBuilder()
        .blockId(BlockId.LICENSE_OPTIONS_NOTE)
        .actionId(ActionId.SEND_LICENSE_OPTIONS_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_LICENSE_OPTIONS_EMAIL)
        .mailType(MailType.LICENSE_OPTIONS)
        .category(EmailCategory.LICENSE)
        .specificLicense(LicenseType.COMMERCIAL)
        .specificLicense(LicenseType.HOSPITAL)
        .specificLicense(LicenseType.RESEARCH_IN_COMMERCIAL)
        .dropdownKey("Send License Options Email")
        .modalTitle("Send License Options")
        .modalSubject(EmailSubject.COMPANY)
        .collapsedNote("Sent license options email")
        .expandedNote("We have sent an email to the user with license options for their affiliated company."))
    , REJECT(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REJECTION_NOTE)
        .actionId(ActionId.SEND_REJECTION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REJECTION_EMAIL)
        .mailType(MailType.REJECTION)
        .category(EmailCategory.DENY)
        .dropdownKey("Send Rejection Email")
        .modalTitle("Rejection Email")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Sent rejection email")
        .expandedNote("The user has been rejected and notified."))
    , REJECT_ALUMNI_ADDRESS(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REJECT_ALUMNI_ADDRESS_NOTE)
        .actionId(ActionId.SEND_REJECT_ALUMNI_ADDRESS_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REJECT_ALUMNI_ADDRESS_EMAIL)
        .mailType(MailType.REJECT_ALUMNI_ADDRESS)
        .category(EmailCategory.DENY)
        .dropdownKey("Send Alumni Rejection Email")
        .modalTitle("Reject Alumni Address")
        .modalSubject(EmailSubject.DEFAULT)
        .collapsedNote("Rejected user due to alumni email address")
        .expandedNote("The user has been rejected due to alumni email address."))
    ;


    private static class DropdownEmailOptionBuilder {
        // blockId/actionId
        private BlockId blockId;
        private ActionId actionId;
        private Optional<ActionId> confirmActionId = Optional.empty();
        // Email
        private MailType mailType;
        // Dropdown menu
        private EmailCategory category;
        private List<LicenseType> specificLicenses = new ArrayList<>();
        private String dropdownKey;
        // View modal
        private boolean notModalEmail = false;
        private Optional<String> modalTitle = Optional.empty();
        private Optional<EmailSubject> modalSubject = Optional.of(EmailSubject.DEFAULT);
        // Additional info block
        private Optional<String> collapsedNote = Optional.empty();
        private String expandedNote;

        public DropdownEmailOptionBuilder blockId(BlockId blockId) {
            this.blockId = blockId;
            return this;
        }

        public DropdownEmailOptionBuilder actionId(ActionId actionId) {
            this.actionId = actionId;
            return this;
        }

        public DropdownEmailOptionBuilder confirmActionId(ActionId confirmActionId) {
            this.confirmActionId = Optional.ofNullable(confirmActionId);
            return this;
        }

        public DropdownEmailOptionBuilder mailType(MailType mailType) {
            this.mailType = mailType;
            return this;
        }

        public DropdownEmailOptionBuilder isNotModalEmail() {
            this.notModalEmail = true;
            return this;
        }

        public DropdownEmailOptionBuilder modalTitle(String modalTitle) {
            this.modalTitle = Optional.ofNullable(modalTitle);
            return this;
        }

        public DropdownEmailOptionBuilder category(EmailCategory category) {
            this.category = category;
            return this;
        }

        public DropdownEmailOptionBuilder specificLicense(LicenseType licenseType) {
            specificLicenses.add(licenseType);
            return this;
        }

        public DropdownEmailOptionBuilder dropdownKey(String dropdownKey) {
            this.dropdownKey = dropdownKey;
            return this;
        }

        public DropdownEmailOptionBuilder modalSubject(EmailSubject modalSubject) {
            this.modalSubject = Optional.ofNullable(modalSubject);
            return this;
        }

        public DropdownEmailOptionBuilder collapsedNote(String collapsedNote) {
            this.collapsedNote = Optional.ofNullable(collapsedNote);
            return this;
        }

        public DropdownEmailOptionBuilder expandedNote(String expandedNote) {
            this.expandedNote = expandedNote;
            return this;
        }
    }

    // blockId/actionId
    private BlockId blockId;
    private ActionId actionId;
    private Optional<ActionId> confirmActionId;
    // Email
    private MailType mailType;
    // Dropdown menu
    private EmailCategory category;
    private List<LicenseType> specificLicenses;
    private String dropdownKey;
    // View modal
    private boolean notModalEmail;
    private Optional<String> modalTitle;
    private Optional<EmailSubject> modalSubject;
    // Additional info block
    private Optional<String> collapsedNote;
    private String expandedNote;

    DropdownEmailOption(DropdownEmailOptionBuilder builder) {
        this.blockId = builder.blockId;
        this.actionId = builder.actionId;
        this.confirmActionId = builder.confirmActionId;
        this.mailType = builder.mailType;
        this.category = builder.category;
        this.specificLicenses = builder.specificLicenses;
        this.dropdownKey = builder.dropdownKey;
        this.notModalEmail = builder.notModalEmail;
        this.modalTitle = builder.modalTitle;
        this.modalSubject = builder.modalSubject;
        this.collapsedNote = builder.collapsedNote;
        this.expandedNote = builder.expandedNote;
    }

    public BlockId getBlockId() {
        return blockId;
    }

    public ActionId getActionId() {
        return actionId;
    }

    public Optional<ActionId> getConfirmActionId() {
        return confirmActionId;
    }

    public MailType getMailType() {
        return mailType;
    }

    public EmailCategory getCategory() { return category; }

    public List<LicenseType> getSpecificLicenses() { return specificLicenses; }

    public String getDropdownKey() {
        return dropdownKey;
    }

    public boolean isNotModalEmail() { return notModalEmail; }

    public Optional<String> getModalTitle() {
        return modalTitle;
    }

    public Optional<EmailSubject> getModalSubject() {
        return modalSubject;
    }

    public Optional<String> getCollapsedNote() {
        return collapsedNote;
    }

    public String getExpandedNote() { return expandedNote;}
}
