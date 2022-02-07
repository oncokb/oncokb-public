package org.mskcc.cbio.oncokb.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class DatabaseReadOnlyException extends AbstractThrowableProblem{

    private static final long serialVersionUID = 1L;

    public DatabaseReadOnlyException() {
        super(ErrorConstants.DATABASE_READ_ONLY, "We are not able to update the content at this moment. Service should be back momentarily.", Status.SERVICE_UNAVAILABLE);
    }
}
