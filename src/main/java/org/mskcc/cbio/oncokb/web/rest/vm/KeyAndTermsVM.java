package org.mskcc.cbio.oncokb.web.rest.vm;

public class KeyAndTermsVM {

    private String key;

    private Boolean readAndAgreeWithTheTerms;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Boolean getReadAndAgreeWithTheTerms() {
        return readAndAgreeWithTheTerms;
    }

    public void setReadAndAgreeWithTheTerms(Boolean readAndAgreeWithTheTerms) {
        this.readAndAgreeWithTheTerms = readAndAgreeWithTheTerms;
    }
}
