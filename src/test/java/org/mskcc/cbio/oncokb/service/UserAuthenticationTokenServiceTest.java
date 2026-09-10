package org.mskcc.cbio.oncokb.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.TrialStatus;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;
import org.mskcc.cbio.oncokb.service.dto.UserTrialDTO;
import org.mskcc.cbio.oncokb.web.rest.errors.LicenseAgreementNotAcceptedException;
import org.mskcc.cbio.oncokb.web.rest.errors.TokenExpiredException;
import org.mskcc.cbio.oncokb.web.rest.errors.TrialAccountExpiredException;

@ExtendWith(MockitoExtension.class)
class UserAuthenticationTokenServiceTest {

    @Mock
    private TokenProvider tokenProvider;

    @Mock
    private TokenService tokenService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private UserService userService;

    private UserAuthenticationTokenService userAuthenticationTokenService;

    @BeforeEach
    void setUp() {
        userAuthenticationTokenService = new UserAuthenticationTokenService(
            tokenProvider,
            tokenService,
            userDetailsService,
            userService
        );
    }

    @Test
    void authorizeCurrentUser_throwsLicenseAgreementException_withTrialActivationKey() {
        UserDetailsDTO userDetailsDTO = new UserDetailsDTO();
        userDetailsDTO.setTrialStatus(TrialStatus.TRIAL_PENDING_TERMS_ACCEPTANCE);
        UserTrialDTO userTrialDTO = new UserTrialDTO();
        userTrialDTO.setActivationKey("trial-key-123");
        userDetailsDTO.setUserTrial(userTrialDTO);

        when(userDetailsService.findByUserIsCurrentUser()).thenReturn(Optional.of(userDetailsDTO));
        when(tokenService.findByUserIsCurrentUser()).thenReturn(Collections.singletonList(validToken()));

        assertThatExceptionOfType(LicenseAgreementNotAcceptedException.class)
            .isThrownBy(() -> userAuthenticationTokenService.authorizeCurrentUser())
            .satisfies(e -> assertThat(e.getParameters()).containsEntry("trialActivationKey", "trial-key-123"));
    }

    @Test
    void authorizeCurrentUser_throwsLicenseAgreementException_withoutTrialActivationKey() {
        UserDetailsDTO userDetailsDTO = new UserDetailsDTO();
        userDetailsDTO.setTrialStatus(TrialStatus.TRIAL_PENDING_TERMS_ACCEPTANCE);

        when(userDetailsService.findByUserIsCurrentUser()).thenReturn(Optional.of(userDetailsDTO));
        when(tokenService.findByUserIsCurrentUser()).thenReturn(Collections.singletonList(validToken()));

        assertThatExceptionOfType(LicenseAgreementNotAcceptedException.class)
            .isThrownBy(() -> userAuthenticationTokenService.authorizeCurrentUser())
            .satisfies(e -> assertThat(e.getParameters()).isEmpty());
    }

    @Test
    void authorizeCurrentUser_throwsTrialAccountExpired_forExpiredTrialUser() {
        UserDetailsDTO userDetailsDTO = new UserDetailsDTO();
        userDetailsDTO.setTrialStatus(TrialStatus.TRIAL);

        User activeUser = new User();
        activeUser.setActivated(true);

        when(userDetailsService.findByUserIsCurrentUser()).thenReturn(Optional.of(userDetailsDTO));
        when(tokenService.findByUserIsCurrentUser()).thenReturn(Collections.singletonList(expiredToken()));
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(activeUser));

        assertThatExceptionOfType(TrialAccountExpiredException.class)
            .isThrownBy(() -> userAuthenticationTokenService.authorizeCurrentUser());
    }

    @Test
    void authorizeCurrentUser_throwsTokenExpired_forExpiredRegularUser() {
        UserDetailsDTO userDetailsDTO = new UserDetailsDTO();
        userDetailsDTO.setTrialStatus(TrialStatus.REGULAR);

        User activeUser = new User();
        activeUser.setActivated(true);

        when(userDetailsService.findByUserIsCurrentUser()).thenReturn(Optional.of(userDetailsDTO));
        when(tokenService.findByUserIsCurrentUser()).thenReturn(Collections.singletonList(expiredToken()));
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(activeUser));

        assertThatExceptionOfType(TokenExpiredException.class)
            .isThrownBy(() -> userAuthenticationTokenService.authorizeCurrentUser());
    }

    private Token validToken() {
        Token token = new Token();
        token.setToken(UUID.randomUUID());
        token.setExpiration(Instant.now().plusSeconds(3600));
        token.setRenewable(true);
        return token;
    }

    private Token expiredToken() {
        Token token = new Token();
        token.setToken(UUID.randomUUID());
        token.setExpiration(Instant.now().minusSeconds(3600));
        token.setRenewable(true);
        return token;
    }
}
