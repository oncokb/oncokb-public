package org.mskcc.cbio.oncokb.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.security.uuid.UUIDFilter;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.service.UserDetailsService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.Activation;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.LicenseAgreement;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.TrialAccount;
import org.mskcc.cbio.oncokb.web.rest.errors.LicenseAgreementNotAcceptedException;
import org.mskcc.cbio.oncokb.web.rest.errors.TokenExpiredException;
import org.mskcc.cbio.oncokb.web.rest.errors.TrialAccountExpiredException;
import org.mskcc.cbio.oncokb.web.rest.vm.LoginVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class UserUUIDController {

    private final TokenProvider tokenProvider;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    public UserUUIDController(TokenProvider tokenProvider, AuthenticationManagerBuilder authenticationManagerBuilder) {
        this.tokenProvider = tokenProvider;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<UUID> authorize(@Valid @RequestBody LoginVM loginVM) {

        UsernamePasswordAuthenticationToken authenticationToken =
            new UsernamePasswordAuthenticationToken(loginVM.getUsername(), loginVM.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Optional<UserDetailsDTO> userDetails = userDetailsService.findByUserIsCurrentUser();
        List<Token> tokenList = tokenService.findByUserIsCurrentUser();
        UUID uuid;

        if (!tokenList.isEmpty()) {
            List<Token> validTokens = tokenList.stream().filter(token -> token.getExpiration().isAfter(Instant.now())).collect(Collectors.toList());
            if (!validTokens.isEmpty()) {
                uuid = validTokens.iterator().next().getToken();
            } else if (canRefreshExpiredTokenForCurrentGracePeriodUser(userDetails)) {
                uuid = refreshExpiredTokens(tokenList);
            } else if (tokenList.stream().noneMatch(Token::isRenewable)) {
                throw new TrialAccountExpiredException();
            } else {
                throw new TokenExpiredException();
            }
        } else {
            Token token = tokenProvider.createTokenForCurrentUserLogin(Optional.empty(), Optional.empty());
            uuid = token.getToken();
        }

        if (userDetails.isPresent()) {
            UserDetailsDTO ud = userDetails.get();
            boolean userHasTrialKey = Optional.ofNullable(ud)
                .map(UserDetailsDTO::getAdditionalInfo)
                .map(AdditionalInfoDTO::getTrialAccount)
                .map(TrialAccount::getActivation)
                .map(Activation::getKey)
                .isPresent();
            boolean trialLicenseNOTAccepted = userHasTrialKey && !Optional.ofNullable(ud)
                .map(UserDetailsDTO::getAdditionalInfo)
                .map(AdditionalInfoDTO::getTrialAccount)
                .map(TrialAccount::getLicenseAgreement)
                .map(LicenseAgreement::getAcceptanceDate)
                .isPresent();
            if (trialLicenseNOTAccepted) {
                Map<String, Object> parameters = new HashMap<>();
                parameters.put("trialActivationKey", ud.getAdditionalInfo().getTrialAccount().getActivation().getKey());
                throw new LicenseAgreementNotAcceptedException(parameters);
            }
        }

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(UUIDFilter.AUTHORIZATION_HEADER, "Bearer " + uuid);
        return new ResponseEntity<>(uuid, httpHeaders, HttpStatus.OK);
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
}
