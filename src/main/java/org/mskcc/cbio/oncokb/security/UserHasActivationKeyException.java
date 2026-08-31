package org.mskcc.cbio.oncokb.security;

import org.springframework.security.core.AuthenticationException;

/**
 * This exception is thrown in case of a user has an activation key.
 */
public class UserHasActivationKeyException extends AuthenticationException {

    private static final long serialVersionUID = 1L;

    public UserHasActivationKeyException(String userEmail) {
        super("User " + userEmail + " has not verified their email");
    }

    public UserHasActivationKeyException(String message, Throwable t) {
        super(message, t);
    }
}
