package org.mskcc.cbio.oncokb.web.rest.slack;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Created by Hongxin Zhang on 4/30/21.
 */
public enum ActionId {
    APPROVE_USER("approve-user")
    , APPROVE_USER_FOR_API_ACCESS("approve-user-for-api-access")
    , CHANGE_LICENSE_TYPE("change-license-type")
    , GIVE_TRIAL_ACCESS("give-trial-access")
    , CONVERT_TO_REGULAR_ACCOUNT("convert-to-regular-account")
    , EXPAND("expand")
    , MORE_ACTIONS("more-actions")
    , SEND_ACADEMIC_FOR_PROFIT_EMAIL("send-academic-for-profit-email")
    , CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL("confirm-send-academic-for-profit-email")
    , SEND_ACADEMIC_CLARIFICATION_EMAIL("send-academic-clarification-email")
    , CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL("confirm-send-academic-clarification-email")
    , SEND_USE_CASE_CLARIFICATION_EMAIL("send-use-case-clarification-email")
    , CONFIRM_SEND_USE_CASE_CLARIFICATION_EMAIL("confirm-send-use-case-clarification-email")
    , SEND_DUPLICATE_USER_CLARIFICATION_EMAIL("send-duplicate-user-clarification-email")
    , CONFIRM_SEND_DUPLICATE_USER_CLARIFICATION_EMAIL("confirm-send-duplicate-user-clarification-email")
    , SEND_REGISTRATION_INFO_CLARIFICATION_EMAIL("send-registration-info-clarification-email")
    , CONFIRM_SEND_REGISTRATION_INFO_CLARIFICATION_EMAIL("confirm-send-registration-info-clarification-email")
    , SEND_HOSPITAL_USE_CLARIFICATION_EMAIL("send-hospital-use-clarification-email")
    , CONFIRM_SEND_HOSPITAL_USE_CLARIFICATION_EMAIL("confirm-send-hospital-use-clarification-email")
    , SEND_COMMERCIAL_USE_CLARIFICATION_EMAIL("send-commercial-use-clarification-email")
    , CONFIRM_SEND_COMMERCIAL_USE_CLARIFICATION_EMAIL("confirm-send-commercial-use-clarification-email")
    , SEND_REJECTION_EMAIL("send-rejection-email")
    , CONFIRM_SEND_REJECTION_EMAIL("confirm-send-rejection-email")
    , SEND_REJECTION_US_SANCTION_EMAIL("send-rejection-us-sanction-email")
    , CONFIRM_SEND_REJECTION_US_SANCTION_EMAIL("confirm-send-rejection-us-sanction-email")
    , SEND_REJECT_ALUMNI_ADDRESS_EMAIL("send-reject-alumni-address-email")
    , CONFIRM_SEND_REJECT_ALUMNI_ADDRESS_EMAIL("confirm-send-reject-alumni-address-email")
    , COLLAPSE("collapse")
    , UPDATE_USER("update-user")
    , INPUT_SUBJECT("input-subject")
    , INPUT_BODY("input-body")
    ;

    String id;

    ActionId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public static ActionId getById(String id) {
        for (ActionId actionId : ActionId.values()) {
            if (actionId.getId().equals(id)) {
                return actionId;
            }
        }
        return null;
    }

    public static boolean isModalEmailAction(ActionId actionId) {
        if (actionId == null) {
            return false;
        }
        for (DropdownEmailOption mailOption : Arrays.stream(DropdownEmailOption.values()).filter(mo -> !mo.isNotModalEmail()).collect(Collectors.toList())) {
            if (actionId.equals(mailOption.getActionId()))
                return true;
        }
        return false;
    }

    public static boolean isDropdownAction(ActionId actionId) {
        if (actionId == null) {
            return false;
        }

        // mail actions
        for (DropdownEmailOption mailOption : DropdownEmailOption.values()) {
            if (actionId.equals(mailOption.getActionId()))
                return true;
        }

        // non mail actions
        if (actionId == CONVERT_TO_REGULAR_ACCOUNT || actionId == COLLAPSE)
            return true;

        return false;
    }
}
