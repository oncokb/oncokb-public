package org.mskcc.cbio.oncokb.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class DatabaseReadOnlyException extends AbstractThrowableProblem{

    private static final long serialVersionUID = 1L;

    public DatabaseReadOnlyException() {
        super(ErrorConstants.SERVICE_UNAVAILABLE, "Service is temporarily unavailable", Status.SERVICE_UNAVAILABLE);
    }
}
