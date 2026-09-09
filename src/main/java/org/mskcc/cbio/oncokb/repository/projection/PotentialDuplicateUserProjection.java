package org.mskcc.cbio.oncokb.repository.projection;

public interface PotentialDuplicateUserProjection {
    Long getId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getCompanyName();

    String getCity();

    String getCountry();
}
