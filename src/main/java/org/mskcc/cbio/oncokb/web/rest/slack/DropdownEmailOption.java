package org.mskcc.cbio.oncokb.web.rest.slack;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.domain.enumeration.slack.DropdownEmailCategory;
import org.mskcc.cbio.oncokb.domain.enumeration.slack.ModalEmailSubject;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * The DropdownEmailOption enumeration. This enum is for the email
 * options in the Slack dropdown menu that the team can select.
 * Approval is not included as the logic is complex and unique.
 *
 * To add a new email option, add the following fields (you will
 * need to create some of these in their respective classes as
 * well, namely ActionId, BlockId, and MailType):
 *
 * REQUIRED:
 * - Block blockId (the corresponding BlockId enum constant
 * associated with the additional info block after email sent)
 * - ActionId actionId (the corresponding ActionId enum constant
 * associated with the initial selection from the menu)
 * - MailType mailType (the corresponding MailType associated
 * with the dropdown option)
 * - DropdownEmailCategory category (the EmailCategory enum constant,
 * which is the group the option goes in)
 * - String dropdownKey (the name of the option in the menu)
 * - String expandedNote (the string that appears in the
 * additional info block after email sent)
 *
 * OPTIONAL:
 * - Optional<ActionId> confirmActionId (the corresponding ActionId
 * associated with confirming the dispatch of email in input modal.
 * This property is REQUIRED if the email uses an input modal.)
 * - List<LicenseType> specificLicenses (the specific license(s)
 * where the option should show up at all. Used if given email
 * will only need to be sent to certain license(s).)
 * - boolean notModalEmail (if the email option doesn't prompt an
 * input modal. Is 'false' by default.)
 * - Optional<String> modalTitle (the title of the input modal
 * when option is selected. This property is REQUIRED if the
 * email option uses an input modal.)
 * - Optional<ModalEmailSubject> modalSubject (the default subject of
 * the input modal. Defaults to EmailSubject.DEFAULT if not defined.)
 * - Optional<String> collapsedNote (the string that appears in the
 * collapsed block after email sent. This property is REQUIRED if the
 * email option does not grant a token to the user.)
 *
 * To add a new property to this enum, add a new variable to both the
 * Builder and the enum, as well as a builder function in the static
 * Builder class and a getter function in the enum.
 *
 *
 * The following template can be used to add a new option:
 *
 , EMAIL_OPTION(new DropdownEmailOptionBuilder()
     .blockId(BlockId)
     .actionId(ActionId)
     .confirmActionId(ActionId)
     .mailType(MailType)
     .category(EmailCategory)
     .specificLicense(LicenseType)
     .dropdownKey("")
     .modalTitle("")
     .modalSubject(EmailSubject)
     .collapsedNote("")
     .expandedNote(""))
 *
 */
public enum DropdownEmailOption {
    GIVE_TRIAL_ACCESS(new DropdownEmailOptionBuilder()
        .blockId(BlockId.TRIAL_ACCOUNT_NOTE)
        .actionId(ActionId.GIVE_TRIAL_ACCESS)
        .mailType(MailType.ACTIVATE_FREE_TRIAL)
        .category(DropdownEmailCategory.TRIAL)
        .dropdownKey("Give Trial Access")
        .isNotModalEmail()
        .expandedNote("The trial account has been initialized and notified."))
    , CLARIFY_ACADEMIC_FOR_PROFIT(new DropdownEmailOptionBuilder()
        .blockId(BlockId.FOR_PROFIT_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .mailType(MailType.CLARIFY_ACADEMIC_FOR_PROFIT)
        .category(DropdownEmailCategory.CLARIFY)
        .specificLicense(LicenseType.ACADEMIC)
        .dropdownKey("Send Academic For Profit Email")
        .modalTitle("For Profit Clarification")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on for-profit affiliation")
        .expandedNote("We have sent a clarification email to the user asking why they are applying for the academic license while affiliated with a for-profit company."))
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL(new DropdownEmailOptionBuilder()
        .blockId(BlockId.ACADEMIC_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_ACADEMIC_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL)
        .category(DropdownEmailCategory.CLARIFY)
        .specificLicense(LicenseType.ACADEMIC)
        .dropdownKey("Send Academic Domain Clarification Email")
        .modalTitle("Domain Clarification")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on noninstitutional email")
        .expandedNote("We have sent a clarification email to the user asking why they could not use an institution email to register."))
    , CLARIFY_USE_CASE(new DropdownEmailOptionBuilder()
        .blockId(BlockId.USE_CASE_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_USE_CASE_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_USE_CASE_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_USE_CASE)
        .category(DropdownEmailCategory.CLARIFY)
        .dropdownKey("Send Use Case Clarification Email")
        .modalTitle("Use Case Clarification")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Sent use case clarification")
        .expandedNote("We have sent a clarification email to the user asking to further explain their use case."))
    , CLARIFY_DUPLICATE_USER(new DropdownEmailOptionBuilder()
        .blockId(BlockId.DUPLICATE_USER_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_DUPLICATE_USER_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_DUPLICATE_USER_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_DUPLICATE_USER)
        .category(DropdownEmailCategory.CLARIFY)
        .dropdownKey("Send Duplicate User Email")
        .modalTitle("Clarify Duplicate User")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on multiple account requests")
        .expandedNote("We have sent a clarification email to the user asking why they registered multiple accounts."))
    , CLARIFY_REGISTRATION_INFO(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REGISTRATION_INFO_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_REGISTRATION_INFO_CLARIFICATION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REGISTRATION_INFO_CLARIFICATION_EMAIL)
        .mailType(MailType.CLARIFY_REGISTRATION_INFO)
        .category(DropdownEmailCategory.CLARIFY)
        .dropdownKey("Send Registration Info Clarification Email")
        .modalTitle("Clarify Registry Info")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Clarified with user on registration info")
        .expandedNote("We have sent a clarification email to the user asking to provide more detailed registration info."))
    , LICENSE_OPTIONS(new DropdownEmailOptionBuilder()
        .blockId(BlockId.LICENSE_OPTIONS_NOTE)
        .actionId(ActionId.SEND_LICENSE_OPTIONS_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_LICENSE_OPTIONS_EMAIL)
        .mailType(MailType.LICENSE_OPTIONS)
        .category(DropdownEmailCategory.LICENSE)
        .specificLicense(LicenseType.COMMERCIAL)
        .specificLicense(LicenseType.HOSPITAL)
        .specificLicense(LicenseType.RESEARCH_IN_COMMERCIAL)
        .dropdownKey("Send License Options Email")
        .modalTitle("Send License Options")
        .modalSubject(ModalEmailSubject.COMPANY)
        .collapsedNote("Sent license options email")
        .expandedNote("We have sent an email to the user with license options for their affiliated company."))
    , REJECT(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REJECTION_NOTE)
        .actionId(ActionId.SEND_REJECTION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REJECTION_EMAIL)
        .mailType(MailType.REJECTION)
        .category(DropdownEmailCategory.DENY)
        .dropdownKey("Send Rejection Email")
        .modalTitle("Rejection Email")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Sent rejection email")
        .expandedNote("The user has been rejected and notified."))
    , REJECT_US_SANCTION(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REJECTION_US_SANCTION_NOTE)
        .actionId(ActionId.SEND_REJECTION_US_SANCTION_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REJECTION_US_SANCTION_EMAIL)
        .mailType(MailType.REJECTION_US_SANCTION)
        .category(DropdownEmailCategory.DENY)
        .dropdownKey("Send US Sanction Rejection Email")
        .modalTitle("US Sanction Rejection")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Sent rejection email")
        .expandedNote("The user has been rejected and notified."))
    , REJECT_ALUMNI_ADDRESS(new DropdownEmailOptionBuilder()
        .blockId(BlockId.REJECT_ALUMNI_ADDRESS_NOTE)
        .actionId(ActionId.SEND_REJECT_ALUMNI_ADDRESS_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_REJECT_ALUMNI_ADDRESS_EMAIL)
        .mailType(MailType.REJECT_ALUMNI_ADDRESS)
        .category(DropdownEmailCategory.DENY)
        .dropdownKey("Send Alumni Rejection Email")
        .modalTitle("Reject Alumni Address")
        .modalSubject(ModalEmailSubject.DEFAULT)
        .collapsedNote("Rejected user due to alumni email address")
        .expandedNote("The user has been rejected due to alumni email address."))
    ;

    // blockId/actionId
    private BlockId blockId;
    private ActionId actionId;
    private Optional<ActionId> confirmActionId;
    // Email
    private MailType mailType;
    // Dropdown menu
    private DropdownEmailCategory category;
    private List<LicenseType> specificLicenses;
    private String dropdownKey;
    // View modal
    private boolean notModalEmail;
    private Optional<String> modalTitle;
    private Optional<ModalEmailSubject> modalSubject;
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

    public DropdownEmailCategory getCategory() { return category; }

    public List<LicenseType> getSpecificLicenses() { return specificLicenses; }

    public String getDropdownKey() {
        return dropdownKey;
    }

    public boolean isNotModalEmail() { return notModalEmail; }

    public Optional<String> getModalTitle() {
        return modalTitle;
    }

    public Optional<ModalEmailSubject> getModalSubject() {
        return modalSubject;
    }

    public Optional<String> getCollapsedNote() {
        return collapsedNote;
    }

    public String getExpandedNote() { return expandedNote;}


    private static class DropdownEmailOptionBuilder {
        // blockId/actionId
        private BlockId blockId;
        private ActionId actionId;
        private Optional<ActionId> confirmActionId = Optional.empty();
        // Email
        private MailType mailType;
        // Dropdown menu
        private DropdownEmailCategory category;
        private List<LicenseType> specificLicenses = new ArrayList<>();
        private String dropdownKey;
        // View modal
        private boolean notModalEmail = false;
        private Optional<String> modalTitle = Optional.empty();
        private Optional<ModalEmailSubject> modalSubject = Optional.of(ModalEmailSubject.DEFAULT);
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

        /**
         *
         * @param modalTitle Title showing in the slack modal. It cannot be longer than 25 characters.
         * @return
         */
        public DropdownEmailOptionBuilder modalTitle(String modalTitle) {
            this.modalTitle = Optional.ofNullable(modalTitle);
            return this;
        }

        public DropdownEmailOptionBuilder category(DropdownEmailCategory category) {
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

        public DropdownEmailOptionBuilder modalSubject(ModalEmailSubject modalSubject) {
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
}
