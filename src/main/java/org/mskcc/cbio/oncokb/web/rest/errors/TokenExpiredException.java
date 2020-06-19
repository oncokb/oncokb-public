package org.mskcc.cbio.oncokb.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class TokenExpiredException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public TokenExpiredException() {
        super(ErrorConstants.TOKEN_EXPIRED_TYPE, "Your account has expired", Status.UNAUTHORIZED);
    }
}
