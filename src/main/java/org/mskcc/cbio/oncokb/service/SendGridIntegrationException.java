package org.mskcc.cbio.oncokb.service;

public class SendGridIntegrationException extends RuntimeException {
    private final Integer statusCode;

    public SendGridIntegrationException(String message, Integer statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public Integer getStatusCode() {
        return statusCode;
    }
}
