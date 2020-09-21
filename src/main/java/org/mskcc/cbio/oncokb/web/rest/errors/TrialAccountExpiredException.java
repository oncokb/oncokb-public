package org.mskcc.cbio.oncokb.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class TrialAccountExpiredException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public TrialAccountExpiredException() {
        super(ErrorConstants.TOKEN_EXPIRED_TYPE, "Your trial account has expired", Status.UNAUTHORIZED);
    }
}
