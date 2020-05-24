package org.mskcc.cbio.oncokb.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class TokenExpiredException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public TokenExpiredException() {
        super(ErrorConstants.TOKEN_EXPIRED_TYPE, "Your token has expired. Please check your email for a renewal link. If you did not receive an email, please reach out to us at registration@oncokb.org", Status.UNAUTHORIZED);
    }
}
