package org.mskcc.cbio.oncokb.security;

import org.springframework.security.core.AuthenticationException;

/**
 * This exception is thrown in case of a user has an activation key.
 */
public class DeactivatedUserException extends AuthenticationException {

    private static final long serialVersionUID = 1L;

    public DeactivatedUserException(String userEmail) {
        super("User " + userEmail + " is deactivated");
    }

    public DeactivatedUserException(String message, Throwable t) {
        super(message, t);
    }
}
