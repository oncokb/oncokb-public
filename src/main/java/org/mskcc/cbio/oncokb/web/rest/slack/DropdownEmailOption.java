package org.mskcc.cbio.oncokb.web.rest.slack;

import org.mskcc.cbio.oncokb.domain.enumeration.EmailCategory;
import org.mskcc.cbio.oncokb.domain.enumeration.EmailSubject;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;

import java.util.Optional;

/**
 * The SlackOption enumeration. This enum is for all the options
 * the team can select for a license request in the Slack channel.
 *
 * Approval is not included as the logic is complex and unique.
 */
public enum DropdownEmailOption {
    GIVE_TRIAL_ACCESS(new DropdownEmailOptionBuilder()
        .actionId(ActionId.GIVE_TRIAL_ACCESS)
        .category(EmailCategory.TRIAL)
        .dropdownKey("Give Trial Access"))
    , CLARIFY_ACADEMIC_FOR_PROFIT(new DropdownEmailOptionBuilder()
        .modalTitle("For Profit Clarification")
        .blockId(BlockId.FOR_PROFIT_CLARIFICATION_NOTE)
        .actionId(ActionId.SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .confirmActionId(ActionId.CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL)
        .category(EmailCategory.CLARIFY)
        .dropdownKey("Send Academic For Profit Email")
        .collapsedNote("Clarified with user on for-profit affiliation")
        .expandedNote("We have sent a clarification email to the user asking why they are applying for the academic license while affiliated with a for-profit company."))
    , CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL(new DropdownEmailOptionBuilder()) // not complete
    , CLARIFY_USE_CASE(new DropdownEmailOptionBuilder()) //"clarifyUseCase", "Clarify - Use case unclear", null)
    , CLARIFY_DUPLICATE_USER(new DropdownEmailOptionBuilder()) //"clarifyDuplicateUser", "Clarify - User registered multiple accounts", null)
    , CLARIFY_REGISTRATION_INFO(new DropdownEmailOptionBuilder()) //"clarifyRegistrationInfo", "Clarify - Detailed registration info required", null)
    , LICENSE_OPTIONS(new DropdownEmailOptionBuilder())
    , REJECT(new DropdownEmailOptionBuilder()) //"rejectionEmail", "User Rejection", null)
    , REJECT_ALUMNI_ADDRESS(new DropdownEmailOptionBuilder()) //"alumniEmailAddress", "Reject - Registered under alumni email address", null)
    ;


    private static class DropdownEmailOptionBuilder {
        // blockId/actionId
        private Optional<BlockId> blockId = Optional.empty();
        private ActionId actionId;
        private Optional<ActionId> confirmActionId = Optional.empty();
        // Email
        private MailType mailType;
        // Dropdown menu
        private EmailCategory category;
        private String dropdownKey;
        // View modal
        private Optional<String> modalTitle = Optional.empty();
        private Optional<EmailSubject> modalSubject = Optional.of(EmailSubject.DEFAULT);
        // Additional info block
        private Optional<String> collapsedNote = Optional.empty();
        private Optional<String> expandedNote = Optional.empty();

        public DropdownEmailOptionBuilder blockId(BlockId blockId) {
            this.blockId = Optional.of(blockId);
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

        public DropdownEmailOptionBuilder modalTitle(String modalTitle) {
            this.modalTitle = Optional.ofNullable(modalTitle);
            return this;
        }

        public DropdownEmailOptionBuilder category(EmailCategory category) {
            this.category = category;
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
            this.expandedNote = Optional.ofNullable(expandedNote);
            return this;
        }
    }

    // blockId/actionId
    private Optional<BlockId> blockId;
    private ActionId actionId;
    private Optional<ActionId> confirmActionId;
    // Email
    private MailType mailType;
    // Dropdown menu
    private EmailCategory category;
    private String dropdownKey;
    // View modal
    private Optional<String> modalTitle;
    private Optional<EmailSubject> modalSubject;
    // Additional info block
    private Optional<String> collapsedNote;
    private Optional<String> expandedNote;

    DropdownEmailOption(DropdownEmailOptionBuilder builder) {
        this.blockId = builder.blockId;
        this.actionId = builder.actionId;
        this.confirmActionId = builder.confirmActionId;
        this.mailType = builder.mailType;
        this.category = builder.category;
        this.dropdownKey = builder.dropdownKey;
        this.modalTitle = builder.modalTitle;
        this.modalSubject = builder.modalSubject;
        this.collapsedNote = builder.collapsedNote;
        this.expandedNote = builder.expandedNote;
    }

    public Optional<BlockId> getBlockId() {
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

    public EmailCategory getCategory() {
        return category;
    }

    public String getDropdownKey() {
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
