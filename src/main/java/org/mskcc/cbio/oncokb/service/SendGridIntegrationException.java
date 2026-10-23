package org.mskcc.cbio.oncokb.service;

public class SendGridIntegrationException extends RuntimeException {
    private final Integer statusCode;
    private final String responseBody;

    public SendGridIntegrationException(String message, Integer statusCode, Throwable cause) {
        this(message, statusCode, null, cause);
    }

    public SendGridIntegrationException(String message, Integer statusCode, String responseBody, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public String getResponseBody() {
        return responseBody;
    }
}
