package org.mskcc.cbio.oncokb.security;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.service.UserService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class CustomOAuthSuccessHandler implements AuthenticationSuccessHandler {

    private static final String SUPPORT_EMAIL = "support@oncokb.org";
    public static final String KEYCLOAK_LOGIN_SUCCESS_QUERY_PARAM = "login_success";
    public static final String KEYCLOAK_ERROR_QUERY_PARAM = "keycloak_error";

    private final ApplicationProperties applicationProperties;
    private final DomainUserDetailsService domainUserDetailsService;
    private final UserService userService;
    private final OAuthAutoRegistrationService oauthAutoRegistrationService;

    public CustomOAuthSuccessHandler(
        ApplicationProperties applicationProperties,
        DomainUserDetailsService domainUserDetailsService,
        UserService userService,
        OAuthAutoRegistrationService oauthAutoRegistrationService
    ) {
        this.applicationProperties = applicationProperties;
        this.domainUserDetailsService = domainUserDetailsService;
        this.userService = userService;
        this.oauthAutoRegistrationService = oauthAutoRegistrationService;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {
        try {
            OidcUser oidcUser = Optional.ofNullable(authentication)
                .map(Authentication::getPrincipal)
                .filter(OidcUser.class::isInstance)
                .map(OidcUser.class::cast)
                .orElseThrow(() -> new IllegalStateException("Keycloak OIDC authentication is required."));

            String email = normalizeEmail(oidcUser.getEmail());
            if (StringUtils.isBlank(email)) {
                throw new IllegalStateException(buildMissingAttributeMessage("email"));
            }

            if (!isAllowedEmail(email)) {
                throw new IllegalStateException("Only users from allowed Keycloak email domains can authenticate.");
            }

            Optional<User> existingUser = userService.getUserWithAuthoritiesByEmailIgnoreCase(email);
            if (!existingUser.isPresent()) {
                String firstName = getRequiredClaim(oidcUser, "given_name", "first name");
                String lastName = getRequiredClaim(oidcUser, "family_name", "last name");
                User createdUser = oauthAutoRegistrationService.registerMskUser(
                    email,
                    firstName,
                    lastName,
                    getOptionalJobTitle(oidcUser)
                );
                setLocalAuthentication(createdUser.getEmail(), oidcUser);
            } else {
                User user = existingUser.get();
                getOptionalJobTitle(oidcUser).ifPresent(jobTitle -> userService.updateUserJobTitle(user, jobTitle));
                setLocalAuthentication(user.getEmail(), oidcUser);
            }

            response.sendRedirect(buildLoginRedirect(KEYCLOAK_LOGIN_SUCCESS_QUERY_PARAM, Boolean.TRUE.toString()));
        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
            response.sendRedirect(buildLoginRedirect(KEYCLOAK_ERROR_QUERY_PARAM, exception.getMessage()));
        }
    }

    private String buildLoginRedirect(String queryParam, String value) {
        return UriComponentsBuilder.fromPath("/login")
            .queryParam(queryParam, value)
            .build()
            .encode(StandardCharsets.UTF_8)
            .toUriString();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ENGLISH);
    }

    private String getRequiredClaim(OidcUser oidcUser, String claim, String displayName) {
        return getOptionalClaim(oidcUser, claim)
            .orElseThrow(() -> new IllegalStateException(buildMissingAttributeMessage(displayName)));
    }

    private Optional<String> getOptionalJobTitle(OidcUser oidcUser) {
        return getOptionalClaim(oidcUser, "job_title")
            .map(Optional::of)
            .orElseGet(() -> getOptionalClaim(oidcUser, "position"));
    }

    private Optional<String> getOptionalClaim(OidcUser oidcUser, String claim) {
        return Optional.ofNullable(oidcUser.getClaimAsString(claim))
            .map(String::trim)
            .filter(StringUtils::isNotBlank);
    }

    private String buildMissingAttributeMessage(String attribute) {
        return "Keycloak account is missing required attribute: " + attribute + ". Please contact " + SUPPORT_EMAIL + ".";
    }

    private void setLocalAuthentication(String email, OidcUser oidcUser) {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken localAuthentication =
            new UsernamePasswordAuthenticationToken(userDetails, oidcUser.getIdToken().getTokenValue(), userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(localAuthentication);
    }

    private boolean isAllowedEmail(String email) {
        List<String> allowedEmailDomains = Optional.ofNullable(applicationProperties.getKeycloak())
            .map(keycloak -> keycloak.getAllowedEmailDomain())
            .filter(StringUtils::isNotBlank)
            .map(this::parseAllowedEmailDomains)
            .filter(domains -> !domains.isEmpty())
            .orElseGet(() -> Collections.singletonList("mskcc.org"));

        return allowedEmailDomains.stream().anyMatch(domain -> email.endsWith("@" + domain));
    }

    private List<String> parseAllowedEmailDomains(String allowedEmailDomains) {
        return Arrays.stream(allowedEmailDomains.split("[,\\s]+"))
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .map(domain -> domain.startsWith("@") ? domain.substring(1) : domain)
            .map(domain -> domain.toLowerCase(Locale.ENGLISH))
            .distinct()
            .collect(Collectors.toList());
    }
}
