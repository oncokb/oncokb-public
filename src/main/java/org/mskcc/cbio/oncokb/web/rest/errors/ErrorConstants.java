package org.mskcc.cbio.oncokb.web.rest.errors;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;

import java.net.URI;

public final class ErrorConstants {

    public static final String ERR_CONCURRENCY_FAILURE = "error.concurrencyFailure";
    public static final String ERR_VALIDATION = "error.validation";
    public static String PROBLEM_BASE_URL;
    public static URI DEFAULT_TYPE;
    public static URI CONSTRAINT_VIOLATION_TYPE;
    public static URI INVALID_PASSWORD_TYPE;
    public static URI EMAIL_ALREADY_USED_TYPE;
    public static URI LOGIN_ALREADY_USED_TYPE;
    public static URI TOKEN_EXPIRED_TYPE;
    public static URI LICENSE_AGREEMENT_NOT_ACCEPTED;
    public static URI DATABASE_READ_ONLY;

    private ErrorConstants(ApplicationProperties applicationProperties) {
        PROBLEM_BASE_URL = applicationProperties.getBaseUrl() + "/problem";
        DEFAULT_TYPE = URI.create(PROBLEM_BASE_URL + "/problem-with-message");
        CONSTRAINT_VIOLATION_TYPE = URI.create(PROBLEM_BASE_URL + "/constraint-violation");
        INVALID_PASSWORD_TYPE = URI.create(PROBLEM_BASE_URL + "/invalid-password");
        EMAIL_ALREADY_USED_TYPE = URI.create(PROBLEM_BASE_URL + "/email-already-used");
        LOGIN_ALREADY_USED_TYPE = URI.create(PROBLEM_BASE_URL + "/login-already-used");
        TOKEN_EXPIRED_TYPE = URI.create(PROBLEM_BASE_URL + "/token-expired");
        LICENSE_AGREEMENT_NOT_ACCEPTED = URI.create(PROBLEM_BASE_URL + "/license-agreement-not-accepted");
        DATABASE_READ_ONLY = URI.create(PROBLEM_BASE_URL + "/database-read-only");
    }
}
