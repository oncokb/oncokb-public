package org.mskcc.cbio.oncokb.web.rest.slack;

import com.amazonaws.services.pinpoint.model.transform.RawEmailJsonUnmarshaller;

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
    , REJECTION_NOTE("rejection-note")
    , REJECT_ALUMNI_ADDRESS_NOTE("reject-alumni-address-note")
    , APPROVED_NOTE("approved-note")
    , TRIAL_ACCOUNT_NOTE("trial-account-note")
    , CONVERT_TO_REGULAR_ACCOUNT_NOTE("convert-to-regular-account-note")
    , SUMMARY_NOTE("summary-note") // This refers to any note at the bottom of an expanded webhook
    , COLLAPSED("collapsed")
    , SUBJECT_INPUT("subject-input")
    , BODY_INPUT("body-input")
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
        return blockId == ACADEMIC_CLARIFICATION_NOTE
            || blockId == FOR_PROFIT_CLARIFICATION_NOTE
            || blockId == USE_CASE_CLARIFICATION_NOTE
            || blockId == DUPLICATE_USER_CLARIFICATION_NOTE
            || blockId == APPROVED_NOTE
            || blockId == TRIAL_ACCOUNT_NOTE
            || blockId == CONVERT_TO_REGULAR_ACCOUNT_NOTE
            || blockId == REJECTION_NOTE
            || blockId == REJECT_ALUMNI_ADDRESS_NOTE
            || blockId == SUMMARY_NOTE;
    }
}
