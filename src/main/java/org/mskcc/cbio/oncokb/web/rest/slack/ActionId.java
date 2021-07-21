package org.mskcc.cbio.oncokb.web.rest.slack;


/**
 * Created by Hongxin Zhang on 4/30/21.
 */
public enum ActionId {
    APPROVE_USER("approve-user")
    , CHANGE_LICENSE_TYPE("change-license-type")
    , GIVE_TRIAL_ACCESS("give-trial-access")
    , CONVERT_TO_REGULAR_ACCOUNT("convert-to-regular-account")
    , EXPAND("expand")
    , MORE_ACTIONS("more-actions")
    , SEND_ACADEMIC_FOR_PROFIT_EMAIL("send-academic-for-profit-email")
    , SEND_ACADEMIC_CLARIFICATION_EMAIL("send-academic-clarification-email")
    , SEND_USE_CASE_CLARIFICATION_EMAIL("send-use-case-clarification-email")
    , SEND_REJECTION_EMAIL("send-rejection-email")
    , COLLAPSE("collapse")
    , UPDATE_USER("update-user")
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
}
