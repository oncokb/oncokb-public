package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The EmailCategory enumeration.
 *
 *  This enum is for the Slack integration. When team member
 *  opens the dropdown menu, each email option should be in
 *  a certain category with a certain category label.
 *
 *  The order of the constants is nontrivial. Besides TRIAL,
 *  they are listed in order chronologically, based on when
 *  we would likely send them to the user (i.e. clarify before
 *  deny, etc.).
 */
public enum EmailCategory {
    TRIAL("Trial"),
    CLARIFY("Clarify"),
    LICENSE("License"),
    DENY("Deny");

    String label;

    EmailCategory(String label) {
        this.label = label;
    }

    public String getLabel() { return label; }
}
