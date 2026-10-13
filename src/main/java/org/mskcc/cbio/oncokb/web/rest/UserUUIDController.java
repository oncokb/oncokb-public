package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.security.uuid.UUIDFilter;
import org.mskcc.cbio.oncokb.service.UserAuthenticationTokenService;
import org.mskcc.cbio.oncokb.web.rest.vm.LoginVM;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.mskcc.cbio.oncokb.web.rest.errors.LicenseAgreementNotAcceptedException;

import javax.validation.Valid;
import java.util.UUID;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class UserUUIDController {

    private final AuthenticationManager authenticationManager;
    private final UserAuthenticationTokenService userAuthenticationTokenService;

    public UserUUIDController(
        AuthenticationManager authenticationManager,
        UserAuthenticationTokenService userAuthenticationTokenService
    ) {
        this.authenticationManager = authenticationManager;
        this.userAuthenticationTokenService = userAuthenticationTokenService;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<UUID> authorize(@Valid @RequestBody LoginVM loginVM) {

        UsernamePasswordAuthenticationToken authenticationToken =
            new UsernamePasswordAuthenticationToken(loginVM.getUsername(), loginVM.getPassword());

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(authenticationToken);
        } catch (AuthenticationException ex) {
            LicenseAgreementNotAcceptedException trialException = findLicenseAgreementException(ex);
            if (trialException != null) {
                throw trialException;
            }
            throw ex;
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UUID uuid = userAuthenticationTokenService.authorizeCurrentUser();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(UUIDFilter.AUTHORIZATION_HEADER, "Bearer " + uuid);
        return new ResponseEntity<>(uuid, httpHeaders, HttpStatus.OK);
    }

    private LicenseAgreementNotAcceptedException findLicenseAgreementException(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof LicenseAgreementNotAcceptedException) {
                return (LicenseAgreementNotAcceptedException) current;
            }
            current = current.getCause();
        }
        return null;
    }
}
