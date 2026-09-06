package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The CompanyApiAccessStatus enumeration.
 *
 * Controls whether the company's users are granted API access (ROLE_API):
 * <ul>
 *     <li>{@code ENABLED} - all company users are granted API access.</li>
 *     <li>{@code DISABLED} - API access is removed from all company users.</li>
 *     <li>{@code USER_SPECIFIC} - API access is not enforced at the company level and is managed per user by an admin.</li>
 * </ul>
 */
public enum CompanyApiAccessStatus {
    ENABLED, DISABLED, USER_SPECIFIC
}
