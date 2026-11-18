package org.mskcc.cbio.oncokb.web.rest.vm;

public class BenchmarkingAgreementVM {
    private String firstName;

    private String lastName;

    private String agreementName;

    private String agreementVersion;

    public BenchmarkingAgreementVM() {
    }

    public BenchmarkingAgreementVM(String firstName, String lastName, String agreementName, String agreementVersion) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.agreementName = agreementName;
        this.agreementVersion = agreementVersion;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAgreementName() {
        return agreementName;
    }

    public void setAgreementName(String agreementName) {
        this.agreementName = agreementName;
    }

    public String getAgreementVersion() {
        return agreementVersion;
    }

    public void setAgreementVersion(String agreementVersion) {
        this.agreementVersion = agreementVersion;
    }
}
