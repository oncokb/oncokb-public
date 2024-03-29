package org.mskcc.cbio.oncokb.web.rest.vm;

import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import javax.validation.constraints.Size;

/**
 * View Model extending the UserDTO, which is meant to be used in the user management UI.
 */
public class ManagedUserVM extends UserDTO {

    public static final int PASSWORD_MIN_LENGTH = 4;

    public static final int PASSWORD_MAX_LENGTH = 100;

    @Size(min = PASSWORD_MIN_LENGTH, max = PASSWORD_MAX_LENGTH)
    private String password;

    private Boolean tokenIsRenewable = false;

    private Integer tokenValidDays;

    private Boolean notifyUserOnTrialCreation = false;

    private Boolean needsMskRocReview = true;

    public ManagedUserVM() {
        // Empty constructor needed for Jackson.
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getTokenIsRenewable() {
        return tokenIsRenewable;
    }

    public void setTokenIsRenewable(Boolean tokenIsRenewable) {
        this.tokenIsRenewable = tokenIsRenewable;
    }

    public Integer getTokenValidDays() {
        return tokenValidDays;
    }

    public void setTokenValidDays(Integer tokenValidDays) {
        this.tokenValidDays = tokenValidDays;
    }

    public Boolean getNotifyUserOnTrialCreation() {
        return notifyUserOnTrialCreation;
    }

    public void setNotifyUserOnTrialCreation(Boolean notifyUserOnTrialCreation) {
        this.notifyUserOnTrialCreation = notifyUserOnTrialCreation;
    }

    public Boolean getNeedsMskRocReview() {
        return needsMskRocReview;
    }

    public void setNeedsMskRocReview(Boolean needsMskRocReview) {
        this.needsMskRocReview = needsMskRocReview;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ManagedUserVM{" + super.toString() + "} ";
    }
}
