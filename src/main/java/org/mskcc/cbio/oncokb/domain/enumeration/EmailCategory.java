package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The EmailCategory enumeration.
 */
public enum EmailCategory {
    TRIAL("Trial"),
    LICENSE("License"),
    CLARIFY("Clarify"),
    DENY("Deny");

    String label;

    EmailCategory(String label) {
        this.label = label;
    }

    public String getLabel() { return label; }
}
