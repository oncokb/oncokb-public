package org.mskcc.cbio.oncokb.security;

import org.springframework.security.core.AuthenticationException;

/**
 * This exception is thrown in case of a not activated user trying to authenticate.
 */
public class UserNotApprovedException extends AuthenticationException {

    private static final long serialVersionUID = 1L;

    public UserNotApprovedException(String userEmail) {
        super("User " + userEmail + " is not approved.");
    }

    public UserNotApprovedException(String message, Throwable t) {
        super(message, t);
    }
}
