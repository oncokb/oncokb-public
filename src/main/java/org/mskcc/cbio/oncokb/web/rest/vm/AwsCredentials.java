package org.mskcc.cbio.oncokb.web.rest.vm;

import javax.validation.constraints.NotEmpty;

public class AwsCredentials {
    @NotEmpty
    private String accessKey;
    
    @NotEmpty
    private String secretKey;

    private String region = "us-east-1";

    public AwsCredentials() {
    }

    public AwsCredentials(String accessKey, String secretKey, String region) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.region = region;
    }

    public String getAccessKey() {
        return this.accessKey;
    }

    public void setAccessKey(String accessKey) {
        this.accessKey = accessKey;
    }

    public String getSecretKey() {
        return this.secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public AwsCredentials accessKey(String accessKey) {
        setAccessKey(accessKey);
        return this;
    }

    public AwsCredentials secretKey(String secretKey) {
        setSecretKey(secretKey);
        return this;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

}
