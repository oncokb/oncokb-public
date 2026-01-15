package org.mskcc.cbio.oncokb.security;

import org.springframework.security.core.AuthenticationException;

/**
 * This exception is thrown when a user's temporary activation grace period has expired.
 */
public class ExpiredGracePeriodException extends AuthenticationException {

    private static final long serialVersionUID = 1L;

    public ExpiredGracePeriodException(String userEmail) {
        super("The grace period has expired. User " + userEmail + " is not approved.");
    }

    public ExpiredGracePeriodException(String message, Throwable t) {
        super(message, t);
    }
}
