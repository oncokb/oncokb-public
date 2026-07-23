package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * Supported audiences for admin bulk email sends.
 */
public enum BulkEmailAudience {
    /** Send to a custom list of users. */
    CUSTOM,
    /** Send to all users, typically for emergency notifications. */
    ALL_USERS,
    /** Send to API users who have not opted out of developer updates. */
    DEVELOPERS,
    /** Send to users who have not opted out of scientific news updates. */
    SCIENTIFIC_NEWS
}
