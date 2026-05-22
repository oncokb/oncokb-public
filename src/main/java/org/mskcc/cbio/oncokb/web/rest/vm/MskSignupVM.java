package org.mskcc.cbio.oncokb.web.rest.vm;

import javax.validation.constraints.NotBlank;

public class MskSignupVM {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String jobTitle;

    private boolean apiAccessRequested;

    private String apiAccessJustification;

    public String getJobTitle() {
        return jobTitle;
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

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public boolean isApiAccessRequested() {
        return apiAccessRequested;
    }

    public void setApiAccessRequested(boolean apiAccessRequested) {
        this.apiAccessRequested = apiAccessRequested;
    }

    public String getApiAccessJustification() {
        return apiAccessJustification;
    }

    public void setApiAccessJustification(String apiAccessJustification) {
        this.apiAccessJustification = apiAccessJustification;
    }
}
