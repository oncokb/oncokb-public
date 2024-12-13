package org.mskcc.cbio.oncokb.web.rest.errors;

import static org.mskcc.cbio.oncokb.config.Constants.MAX_SERVICE_ACCOUNT_TOKENS;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class TooManyTokensException extends AbstractThrowableProblem {
    public TooManyTokensException() {
        super(ErrorConstants.TOO_MANY_TOKENS, "May not exceed " + MAX_SERVICE_ACCOUNT_TOKENS + " tokens.", Status.FORBIDDEN);
    }
}
