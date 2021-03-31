package org.mskcc.cbio.oncokb.service.dto.oncokbcore;

import org.mskcc.cbio.oncokb.service.dto.Activation;
import org.mskcc.cbio.oncokb.service.dto.LicenseAgreement;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class TrialAccount {
    Activation activation;
    LicenseAgreement licenseAgreement;

    public Activation getActivation() {
        return activation;
    }

    public void setActivation(Activation activation) {
        this.activation = activation;
    }

    public LicenseAgreement getLicenseAgreement() {
        return licenseAgreement;
    }

    public void setLicenseAgreement(LicenseAgreement licenseAgreement) {
        this.licenseAgreement = licenseAgreement;
    }
}
