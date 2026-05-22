package org.mskcc.cbio.oncokb.web.rest.vm;

public class KeycloakSignupUser {
    private String email;
    private String firstName;
    private String lastName;

    public KeycloakSignupUser(String email, String firstName, String lastName) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }
}
