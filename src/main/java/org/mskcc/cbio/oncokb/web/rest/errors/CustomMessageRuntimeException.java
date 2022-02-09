package org.mskcc.cbio.oncokb.web.rest.errors;

public class CustomMessageRuntimeException extends RuntimeException {
    public CustomMessageRuntimeException(String message) {
        super(message);
    }
}
