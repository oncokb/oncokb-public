package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.security.CustomOAuthSuccessHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.zalando.problem.spring.web.advice.security.SecurityProblemSupport;

@Configuration
@Order(1)
@Import(SecurityProblemSupport.class)
public class SecurityConfigurationOAuth extends WebSecurityConfigurerAdapter {

    private final SecurityProblemSupport problemSupport;
    private final ApplicationProperties applicationProperties;
    private final CustomOAuthSuccessHandler customOAuthSuccessHandler;

    public SecurityConfigurationOAuth(
        SecurityProblemSupport problemSupport,
        ApplicationProperties applicationProperties,
        CustomOAuthSuccessHandler customOAuthSuccessHandler
    ) {
        this.problemSupport = problemSupport;
        this.applicationProperties = applicationProperties;
        this.customOAuthSuccessHandler = customOAuthSuccessHandler;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .requestMatchers()
            .mvcMatchers("/oauth2/**", "/login/oauth2/**")
            .and()
            .csrf()
            .disable()
            .exceptionHandling()
                .authenticationEntryPoint(problemSupport)
                .accessDeniedHandler(problemSupport)
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            .and()
            .authorizeRequests()
                .mvcMatchers("/oauth2/oncokb-token").authenticated()
                .mvcMatchers("/oauth2/**", "/login/oauth2/**").permitAll();

        if (isKeycloakEnabled()) {
            http
                .oauth2Login()
                    .successHandler(customOAuthSuccessHandler)
                    .failureUrl("/login?keycloak_error=Unable%20to%20authenticate%20with%20Keycloak");
        }
    }

    private boolean isKeycloakEnabled() {
        return applicationProperties.getKeycloak() != null &&
            Boolean.TRUE.equals(applicationProperties.getKeycloak().getEnabled());
    }
}
