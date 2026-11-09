package org.mskcc.cbio.oncokb.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

/**
 * Thrown during login when the account exists but its state does not allow sign-in
 * (for example, the account request was rejected, or the activation grace period expired
 * while the request is still pending review). Responds with 403 Forbidden.
 *
 * <p>The {@code detail} is shown to the user as-is on the login page, so it must be written
 * for end users and must not include internal data such as exception messages.
 *
 * <p>This is a {@link org.zalando.problem.ThrowableProblem} rather than a
 * {@link org.springframework.web.server.ResponseStatusException} on purpose:
 * <ul>
 *   <li>{@link ExceptionTranslator} returns problems unchanged, so the 403 status and the
 *   detail are kept. A {@code ResponseStatusException} thrown from a
 *   {@code UserDetailsService} is wrapped by Spring Security in an
 *   {@code InternalAuthenticationServiceException}, which becomes a 401 whose detail is
 *   {@code 403 FORBIDDEN "..."}, and in production any detail containing an email address
 *   is replaced with "Unexpected runtime exception".</li>
 *   <li>Spring Security still wraps this exception, so
 *   {@link org.mskcc.cbio.oncokb.web.rest.UserUUIDController} unwraps it before rethrowing.</li>
 * </ul>
 *
 * See oncokb/oncokb-pipeline#1212.
 */
public class AccountAccessDeniedException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public AccountAccessDeniedException(String detail) {
        super(ErrorConstants.ACCOUNT_ACCESS_DENIED_TYPE, "Account access denied", Status.FORBIDDEN, detail);
    }
}
