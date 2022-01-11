package org.mskcc.cbio.oncokb.web.rest.errors;

import java.util.Map;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class LicenseAgreementNotAcceptedException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public LicenseAgreementNotAcceptedException(Map<String, Object> parameters) {
        super(
            ErrorConstants.LICENSE_AGREEMENT_NOT_ACCEPTED, 
            "You have not accepted the OncoKB trial license agreement", 
            Status.UNAUTHORIZED,
            null,
            null,
            null,
            parameters
        );
    }
}