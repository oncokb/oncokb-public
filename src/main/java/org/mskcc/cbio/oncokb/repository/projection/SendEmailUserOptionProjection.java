package org.mskcc.cbio.oncokb.repository.projection;

public interface SendEmailUserOptionProjection {
    String getLogin();

    String getEmail();

    String getFirstName();

    String getLastName();

    Boolean getActivated();

    String getLicenseType();

    /**
     * Native query drivers can return CASE/boolean expressions as non-Boolean scalars
     * (for example 0/1 as Number). Keep this as Object and normalize in service code.
     */
    Object getIsAdmin();
}
