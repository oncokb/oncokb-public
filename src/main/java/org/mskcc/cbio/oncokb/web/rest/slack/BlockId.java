package org.mskcc.cbio.oncokb.web.rest.slack;

/**
 * Created by Benjamin Xu on 6/30/21.
 */
public enum BlockId {
    USER_ID("user-id")
    , LICENSE_TYPE("license-type")
    , ACCOUNT_STATUS("account-status")
    , ACCOUNT_INFO("account-info")
    , ORGANIZATION_INFO("organization-info")
    , ACADEMIC_CLARIFICATION_NOTE("academic-clarification-note")
    , FOR_PROFIT_CLARIFICATION_NOTE("for-profit-clarification-note")
    , USE_CASE_CLARIFICATION_NOTE("use-case-clarification-note")
    , DUPLICATE_USER_CLARIFICATION_NOTE("duplicate-user-clarification-note")
    , DUPLICATE_USER_INFO("duplicate-user-info")
    , REGISTRATION_INFO_CLARIFICATION_NOTE("registration-info-clarification-note")
    , LICENSE_OPTIONS_NOTE("license-options-clarification-note")
    , REJECTION_NOTE("rejection-note")
    , REJECTION_US_SANCTION_NOTE("rejection-us-sanction-note")
    , REJECT_ALUMNI_ADDRESS_NOTE("reject-alumni-address-note")
    , APPROVED_NOTE("approved-note")
    , TRIAL_ACCOUNT_NOTE("trial-account-note")
    , CONVERT_TO_REGULAR_ACCOUNT_NOTE("convert-to-regular-account-note")
    , COLLAPSED("collapsed")
    , SUBJECT_INPUT("subject-input")
    , BODY_INPUT("body-input")
    , API_ACCESS("api-access")
    ;

    String id;

    BlockId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public static BlockId getById(String id) {
        for (BlockId blockId : BlockId.values()) {
            if (blockId.getId().equals(id)) {
                return blockId;
            }
        }
        return null;
    }

    public static boolean isSummaryNote(BlockId blockId) {
        if (blockId == null) {
            return false;
        }

        // mail notes
        for (DropdownEmailOption mailOption : DropdownEmailOption.values()) {
            if (blockId.equals(mailOption.getBlockId()))
                return true;
        }

        // non mail notes
        if (blockId == CONVERT_TO_REGULAR_ACCOUNT_NOTE)
            return true;

        return false;
    }
}
