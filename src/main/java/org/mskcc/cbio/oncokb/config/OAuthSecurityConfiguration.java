package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.security.CustomOAuthSuccessHandler;
import org.mskcc.cbio.oncokb.security.KeycloakIdpHintAuthorizationRequestResolver;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.zalando.problem.spring.web.advice.security.SecurityProblemSupport;

@Configuration
@Order(1)
@Import(SecurityProblemSupport.class)
@ConditionalOnProperty(prefix = "application.keycloak", name = "enabled", havingValue = "true")
public class OAuthSecurityConfiguration extends WebSecurityConfigurerAdapter {

    private final SecurityProblemSupport problemSupport;
    private final ApplicationProperties applicationProperties;
    private final CustomOAuthSuccessHandler customOAuthSuccessHandler;
    private final ClientRegistration oidcClientRegistration;
    private final OAuth2AuthorizationRequestResolver authorizationRequestResolver;

    public OAuthSecurityConfiguration(
        SecurityProblemSupport problemSupport,
        ApplicationProperties applicationProperties,
        CustomOAuthSuccessHandler customOAuthSuccessHandler,
        ClientRegistrationRepository clientRegistrationRepository
    ) {
        this.problemSupport = problemSupport;
        this.applicationProperties = applicationProperties;
        this.customOAuthSuccessHandler = customOAuthSuccessHandler;
        this.oidcClientRegistration = clientRegistrationRepository.findByRegistrationId("oidc");
        this.authorizationRequestResolver = new KeycloakIdpHintAuthorizationRequestResolver(clientRegistrationRepository);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .requestMatchers(matchers -> matchers
                .mvcMatchers("/oauth2/**", "/login/oauth2/**"))
            // OAuth login uses a temporary session before the frontend exchanges it for a legacy API token.
            // Keep CSRF enabled so cross-site pages cannot trigger that session-authenticated token exchange.
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringAntMatchers("/oauth2/logout"))
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint(problemSupport)
                .accessDeniedHandler(problemSupport))
            .sessionManagement(management -> management
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeRequests(requests -> requests
                .mvcMatchers("/oauth2/oncokb-token").authenticated()
                .mvcMatchers("/oauth2/**", "/login/oauth2/**").permitAll());

        http
            .logout(logout -> logout
                // by default, Spring Security uses POST for logout, but we want to support GET for easier integration with Keycloak's logout flow
                // CSRF protected logout is less of a security risk since the logout endpoint does not perform any state-changing operations and does not require authentication (it will simply invalidate the session if it exists)
                // Note for future: If we need to support persisted sessions in the future, we need to consider having a shared persisted session storage using Redis. If a pod is restarted,
                // the session will not be lost if we have session stored elsewhere.
                .logoutRequestMatcher(new AntPathRequestMatcher("/oauth2/logout", "GET"))
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) ->
                    response.sendRedirect(
                        SecurityUtils.getKeycloakLogoutURL(
                            oidcClientRegistration,
                            authentication,
                            applicationProperties.getBaseUrl()
                        )
                    )
                ));

        if (isKeycloakEnabled()) {
            http
                .oauth2Login(login -> login
                    .authorizationEndpoint(authorization -> authorization
                        .authorizationRequestResolver(authorizationRequestResolver))
                    .successHandler(customOAuthSuccessHandler)
                    .failureUrl("/login?keycloak_error=Unable%20to%20authenticate%20with%20Keycloak"));
        }
    }

    private boolean isKeycloakEnabled() {
        return applicationProperties.getKeycloak() != null &&
            Boolean.TRUE.equals(applicationProperties.getKeycloak().getEnabled());
    }
}
