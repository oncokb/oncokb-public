package org.mskcc.cbio.oncokb.web.rest.errors;

import io.github.jhipster.config.JHipsterConstants;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.web.server.ResponseStatusException;
import org.zalando.problem.Problem;
import org.zalando.problem.Status;

import static org.assertj.core.api.Assertions.assertThat;

public class ExceptionTranslatorTest {

    private static final String REASON = "Your account request was rejected. Please contact contact@oncokb.org.";

    private ExceptionTranslator createProductionTranslator() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(JHipsterConstants.SPRING_PROFILE_PRODUCTION);
        return new ExceptionTranslator(env);
    }

    @Test
    public void testResponseStatusReasonIsNotMaskedInProduction() {
        Problem problem = createProductionTranslator()
            .prepare(new ResponseStatusException(HttpStatus.FORBIDDEN, REASON), Status.FORBIDDEN, Problem.DEFAULT_TYPE)
            .build();

        assertThat(problem.getDetail()).isEqualTo(REASON);
    }

    @Test
    public void testWrappedResponseStatusReasonIsUsedAsDetail() {
        // DaoAuthenticationProvider wraps exceptions thrown by UserDetailsService during login.
        ResponseStatusException cause = new ResponseStatusException(HttpStatus.FORBIDDEN, REASON);
        Problem problem = createProductionTranslator()
            .prepare(new InternalAuthenticationServiceException(cause.getMessage(), cause), Status.UNAUTHORIZED, Problem.DEFAULT_TYPE)
            .build();

        assertThat(problem.getDetail()).isEqualTo(REASON);
    }

    @Test
    public void testOtherMessagesWithPackageNamesAreStillMaskedInProduction() {
        Problem problem = createProductionTranslator()
            .prepare(new IllegalStateException("Failure in org.mskcc.cbio.oncokb.Foo"), Status.INTERNAL_SERVER_ERROR, Problem.DEFAULT_TYPE)
            .build();

        assertThat(problem.getDetail()).isEqualTo("Unexpected runtime exception");
    }
}
