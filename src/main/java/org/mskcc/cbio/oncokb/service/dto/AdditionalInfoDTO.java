package org.mskcc.cbio.oncokb.service.dto;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class AdditionalInfoDTO {
    Activation trialAccountActivation;
    LicenseAgreement trialLicenseAgreement;

    public Activation getTrialAccountActivation() {
        return trialAccountActivation;
    }

    public void setTrialAccountActivation(Activation trialAccountActivation) {
        this.trialAccountActivation = trialAccountActivation;
    }

    public LicenseAgreement getTrialLicenseAgreement() {
        return trialLicenseAgreement;
    }

    public void setTrialLicenseAgreement(LicenseAgreement trialLicenseAgreement) {
        this.trialLicenseAgreement = trialLicenseAgreement;
    }
}
