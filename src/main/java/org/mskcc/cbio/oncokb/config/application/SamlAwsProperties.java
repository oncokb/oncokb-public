package org.mskcc.cbio.oncokb.config.application;

public class SamlAwsProperties {

    private String serviceAccountUsername;
    private String serviceAccountPassword;
    private String principalArn; // The Amazon Resource Name (ARN) of the SAML provider in IAM that describes the IdP.
    private String roleArn; // The Amazon Resource Name (ARN) of the role that the caller is assuming.
    private String region = "us-east-1";


    public String getServiceAccountUsername() {
        return this.serviceAccountUsername;
    }

    public void setServiceAccountUsername(String serviceAccountUsername) {
        this.serviceAccountUsername = serviceAccountUsername;
    }

    public String getServiceAccountPassword() {
        return this.serviceAccountPassword;
    }

    public void setServiceAccountPassword(String serviceAccountPassword) {
        this.serviceAccountPassword = serviceAccountPassword;
    }

    public String getPrincipalArn() {
        return this.principalArn;
    }

    public void setPrincipalArn(String principalArn) {
        this.principalArn = principalArn;
    }

    public String getRoleArn() {
        return this.roleArn;
    }

    public void setRoleArn(String roleArn) {
        this.roleArn = roleArn;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

}
