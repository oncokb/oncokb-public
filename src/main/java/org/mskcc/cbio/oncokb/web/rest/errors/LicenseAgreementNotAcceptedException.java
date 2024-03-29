package org.mskcc.cbio.oncokb.web.rest.errors;

import java.util.Map;
import org.mskcc.cbio.oncokb.config.Constants;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class LicenseAgreementNotAcceptedException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public LicenseAgreementNotAcceptedException(Map<String, Object> parameters) {
        super(
            ErrorConstants.LICENSE_AGREEMENT_NOT_ACCEPTED, 
            String.format("You have not accepted the %s trial license agreement", Constants.ONCOKB_TM), 
            Status.UNAUTHORIZED,
            null,
            null,
            null,
            parameters
        );
    }
}
