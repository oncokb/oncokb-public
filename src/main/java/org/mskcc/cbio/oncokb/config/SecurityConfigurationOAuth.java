package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.security.CustomOAuthSuccessHandler;
import org.mskcc.cbio.oncokb.security.KeycloakIdpHintAuthorizationRequestResolver;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.zalando.problem.spring.web.advice.security.SecurityProblemSupport;

@Configuration
@Order(1)
@Import(SecurityProblemSupport.class)
public class SecurityConfigurationOAuth extends WebSecurityConfigurerAdapter {

    private final SecurityProblemSupport problemSupport;
    private final ApplicationProperties applicationProperties;
    private final CustomOAuthSuccessHandler customOAuthSuccessHandler;
    private final ClientRegistration oidcClientRegistration;
    private final OAuth2AuthorizationRequestResolver authorizationRequestResolver;

    public SecurityConfigurationOAuth(
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
                .logoutUrl("/oauth2/logout")
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
