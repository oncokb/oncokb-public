package org.mskcc.cbio.oncokb.repository.projection;

public interface SendEmailUserOptionProjection {
    String getLogin();

    String getEmail();

    String getFirstName();

    String getLastName();

    Boolean getActivated();

    String getLicenseType();

    Boolean getIsAdmin();
}
