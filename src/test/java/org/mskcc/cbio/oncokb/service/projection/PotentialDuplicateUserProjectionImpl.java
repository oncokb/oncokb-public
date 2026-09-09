package org.mskcc.cbio.oncokb.service.projection;

import org.mskcc.cbio.oncokb.repository.projection.PotentialDuplicateUserProjection;

public class PotentialDuplicateUserProjectionImpl implements PotentialDuplicateUserProjection {
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String companyName;
    private final String city;
    private final String country;

    public PotentialDuplicateUserProjectionImpl(
        Long id,
        String firstName,
        String lastName,
        String email,
        String companyName,
        String city,
        String country
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.companyName = companyName;
        this.city = city;
        this.country = country;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public String getFirstName() {
        return firstName;
    }

    @Override
    public String getLastName() {
        return lastName;
    }

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getCompanyName() {
        return companyName;
    }

    @Override
    public String getCity() {
        return city;
    }

    @Override
    public String getCountry() {
        return country;
    }
}
