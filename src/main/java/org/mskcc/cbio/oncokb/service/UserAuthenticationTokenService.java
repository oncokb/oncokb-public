package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.enumeration.TrialStatus;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;
import org.mskcc.cbio.oncokb.domain.enumeration.TrialStatus;
import org.mskcc.cbio.oncokb.web.rest.errors.LicenseAgreementNotAcceptedException;
import org.mskcc.cbio.oncokb.web.rest.errors.TokenExpiredException;
import org.mskcc.cbio.oncokb.web.rest.errors.TrialAccountExpiredException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserAuthenticationTokenService {
    private final TokenProvider tokenProvider;
    private final TokenService tokenService;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    public UserAuthenticationTokenService(
        TokenProvider tokenProvider,
        TokenService tokenService,
        UserDetailsService userDetailsService,
        UserService userService
    ) {
        this.tokenProvider = tokenProvider;
        this.tokenService = tokenService;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
    }

    public UUID authorizeCurrentUser() {
        Optional<UserDetailsDTO> userDetails = userDetailsService.findByUserIsCurrentUser();
        List<Token> tokenList = tokenService.findByUserIsCurrentUser();
        UUID uuid;

        if (!tokenList.isEmpty()) {
            List<Token> validTokens = tokenList.stream()
                .filter(token -> token.getExpiration().isAfter(Instant.now()))
                .collect(Collectors.toList());
            if (!validTokens.isEmpty()) {
                uuid = validTokens.iterator().next().getToken();
            } else if (canRefreshExpiredTokenForCurrentGracePeriodUser(userDetails)) {
                uuid = refreshExpiredTokens(tokenList);
            } else if (isCurrentUserOnTrial(userDetails)) {
                throw new TrialAccountExpiredException();
            } else {
                throw new TokenExpiredException();
            }
        } else {
            Token token = tokenProvider.createTokenForCurrentUserLogin(Optional.empty(), Optional.empty());
            uuid = token.getToken();
        }

        validateTrialLicenseAgreement(userDetails);

        return uuid;
    }

    public UUID authorizeCurrentUserViaOAuth() {
        List<Token> tokenList = tokenService.findByUserIsCurrentUser();
        if (tokenList.isEmpty()) {
            return tokenProvider.createTokenForCurrentUserLogin(Optional.empty(), Optional.empty()).getToken();
        }

        List<Token> validTokens = tokenList.stream()
            .filter(token -> token.getExpiration().isAfter(Instant.now()))
            .collect(Collectors.toList());
        if (!validTokens.isEmpty()) {
            return validTokens.iterator().next().getToken();
        }

        // In the future, if we allow OAuth for other users, then
        // we need to think about whether we want to allow refreshing expired tokens automatically
        // and the behavior of the trial and grace periods.

        return refreshExpiredTokens(tokenList);
    }

    private boolean canRefreshExpiredTokenForCurrentGracePeriodUser(Optional<UserDetailsDTO> userDetails) {
        return userService.getUserWithAuthorities()
            .filter(user -> !user.getActivated())
            .flatMap(user -> userDetails
                .map(UserDetailsDTO::getLicenseType)
                .filter(licenseType -> SecurityUtils.isWithinActivationGracePeriod(user, licenseType)))
            .isPresent();
    }

    private UUID refreshExpiredTokens(List<Token> tokenList) {
        Instant defaultExpiration = Instant.now().plusSeconds(TokenProvider.EXPIRATION_TIME_IN_SECONDS);
        tokenList.forEach(token -> {
            Instant expirationBased = token.getExpiration().plusSeconds(TokenProvider.EXPIRATION_TIME_IN_SECONDS);
            token.setExpiration(expirationBased.isBefore(defaultExpiration) ? defaultExpiration : expirationBased);
            tokenService.save(token);
        });

        return tokenList.stream()
            .max(Comparator.comparing(Token::getExpiration))
            .map(Token::getToken)
            .orElseThrow(TokenExpiredException::new);
    }

    private void validateTrialLicenseAgreement(Optional<UserDetailsDTO> userDetails) {
        if (userDetails.isPresent()) {
            UserDetailsDTO ud = userDetails.get();
            if (TrialStatus.TRIAL_PENDING_TERMS_ACCEPTANCE.equals(ud.getTrialStatus())) {
                if (ud.getUserTrial() != null && ud.getUserTrial().getActivationKey() != null) {
                    throw new LicenseAgreementNotAcceptedException(java.util.Collections.singletonMap("trialActivationKey", ud.getUserTrial().getActivationKey()));
                }
                throw new LicenseAgreementNotAcceptedException(java.util.Collections.emptyMap());
            }
        }
    }

    private boolean isCurrentUserOnTrial(Optional<UserDetailsDTO> userDetails) {
        return userDetails
            .map(UserDetailsDTO::getTrialStatus)
            .map(trialStatus -> trialStatus == TrialStatus.TRIAL)
            .orElse(false);
    }
}
