package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.security.uuid.UUIDFilter;
import org.mskcc.cbio.oncokb.service.UserAuthenticationTokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/oauth2")
public class OAuthTokenController {

    private final UserAuthenticationTokenService userAuthenticationTokenService;

    public OAuthTokenController(UserAuthenticationTokenService userAuthenticationTokenService) {
        this.userAuthenticationTokenService = userAuthenticationTokenService;
    }

    @PostMapping("/oncokb-token")
    public ResponseEntity<UUID> authorize(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Keycloak login is required.");
        }

        UUID uuid = userAuthenticationTokenService.authorizeCurrentUser();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(UUIDFilter.AUTHORIZATION_HEADER, "Bearer " + uuid);
        return new ResponseEntity<>(uuid, httpHeaders, HttpStatus.OK);
    }
}
