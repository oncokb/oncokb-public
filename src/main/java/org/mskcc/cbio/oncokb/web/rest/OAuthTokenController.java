package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.security.uuid.UUIDFilter;
import org.mskcc.cbio.oncokb.service.UserAuthenticationTokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.time.Duration;
import java.util.UUID;

/**
 * The purpose of this controller is to return the user's API token
 * once the user has been authenticated by Keycloak. Our frontend currently, stores the API token in local storage
 * and uses it for all API calls. Once we fully move to Keycloak and remove the old Bearer token authentication,
 * we can remove this controller.
 */
@RestController
@RequestMapping("/oauth2")
public class OAuthTokenController {
    private final UserAuthenticationTokenService userAuthenticationTokenService;

    public OAuthTokenController(UserAuthenticationTokenService userAuthenticationTokenService) {
        this.userAuthenticationTokenService = userAuthenticationTokenService;
    }

    @PostMapping("/oncokb-token")
    public ResponseEntity<UUID> authorize(Authentication authentication, HttpServletRequest request) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Keycloak login is required.");
        }

        UUID uuid = userAuthenticationTokenService.authorizeCurrentUserViaOAuth();
        invalidateOAuthSession(request);

        return buildTokenResponse(uuid);
    }

    private ResponseEntity<UUID> buildTokenResponse(UUID uuid) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(UUIDFilter.AUTHORIZATION_HEADER, "Bearer " + uuid);
        expireCookie(httpHeaders, "SESSION");
        expireCookie(httpHeaders, "JSESSIONID");
        return new ResponseEntity<>(uuid, httpHeaders, HttpStatus.OK);
    }

    private void invalidateOAuthSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    private void expireCookie(HttpHeaders httpHeaders, String name) {
        httpHeaders.add(
            HttpHeaders.SET_COOKIE,
            ResponseCookie.from(name, "")
                .path("/")
                .maxAge(Duration.ZERO)
                .httpOnly(true)
                .build()
                .toString()
        );
    }
}
