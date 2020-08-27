package org.mskcc.cbio.oncokb.config;

import com.github.mkopylec.recaptcha.validation.RecaptchaValidator;
import org.mskcc.cbio.oncokb.security.*;
import org.mskcc.cbio.oncokb.security.jwt.*;

import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.security.uuid.UUIDConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.filter.CorsFilter;
import org.zalando.problem.spring.web.advice.security.SecurityProblemSupport;

@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
@Import(SecurityProblemSupport.class)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    private final TokenProvider tokenProvider;
    private final RecaptchaValidator recaptchaValidator;

    private final CorsFilter corsFilter;
    private final SecurityProblemSupport problemSupport;

    public SecurityConfiguration(RecaptchaValidator recaptchaValidator, TokenProvider tokenProvider, CorsFilter corsFilter, SecurityProblemSupport problemSupport) {
        this.recaptchaValidator = recaptchaValidator;
        this.tokenProvider = tokenProvider;
        this.corsFilter = corsFilter;
        this.problemSupport = problemSupport;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
            .antMatchers(HttpMethod.OPTIONS, "/**")
            .antMatchers("/app/**/*.{js,html}")
            .antMatchers("/*.xml")
            .antMatchers("/i18n/**")
            .antMatchers("/content/**")
            .antMatchers("/swagger-ui/index.html")
            .antMatchers("/test/**");
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        // @formatter:off
        http
            .csrf()
            .disable()
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling()
                .authenticationEntryPoint(problemSupport)
                .accessDeniedHandler(problemSupport)
        .and()
            .headers()
            .contentSecurityPolicy("default-src 'self'; frame-src 'self' https://*.google.com https://recaptcha.net https://*.oncokb.org https://*.youtube.com https://*.bilibili.com https://*.gitbook.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://storage.googleapis.com www.google-analytics.com https://recaptcha.net https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: www.google-analytics.com; font-src 'self' data:; connect-src 'self' https://*")
        .and()
            .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER_WHEN_DOWNGRADE)
        .and()
            .featurePolicy("geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; speaker 'none'; fullscreen 'self'; payment 'none'")
        .and()
            .frameOptions()
            .deny()
        .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
            .authorizeRequests()
            .antMatchers("/api/v1/info").permitAll()
            .antMatchers("/api/v1/levels").permitAll()
            .antMatchers("/api/authenticate").permitAll()
            .antMatchers("/api/register").permitAll()
            .antMatchers("/api/activate").permitAll()
            .antMatchers("/api/slack").permitAll()
            // Permits the api swagger definitions through proxy
            .antMatchers("/api/v1/v2/api-docs").permitAll()
            .antMatchers("/api/private/utils/dataRelease/downloadAvailability").permitAll()

            .antMatchers("/api/v1/annotate/**").hasAnyAuthority(AuthoritiesConstants.USER)

            .antMatchers("/api/v1/search/**").hasAnyAuthority(AuthoritiesConstants.PREMIUM_USER, AuthoritiesConstants.ADMIN)
            .antMatchers("/api/v1/genes/lookup").hasAnyAuthority(AuthoritiesConstants.PUBLIC_WEBSITE, AuthoritiesConstants.USER, AuthoritiesConstants.PREMIUM_USER, AuthoritiesConstants.ADMIN)
            .antMatchers("/api/v1/genes/**").hasAnyAuthority(AuthoritiesConstants.PREMIUM_USER, AuthoritiesConstants.ADMIN)
            .antMatchers("/api/v1/variants/**").hasAnyAuthority(AuthoritiesConstants.PREMIUM_USER, AuthoritiesConstants.ADMIN)
            .antMatchers("/api/v1/drugs/**").hasAnyAuthority(AuthoritiesConstants.PREMIUM_USER, AuthoritiesConstants.ADMIN)

            .antMatchers("/api/v1/utils/allCuratedGenes").permitAll()
            .antMatchers("/api/v1/utils/allCuratedGenes.txt").permitAll()
            .antMatchers("/api/v1/utils/allCuratedGenes.json").permitAll()
            .antMatchers("/api/v1/utils/cancerGeneList").permitAll()
            .antMatchers("/api/v1/utils/cancerGeneList.txt").permitAll()
            .antMatchers("/api/v1/utils/cancerGeneList.json").permitAll()
            .antMatchers("/api/v1/utils/**").hasAnyAuthority(AuthoritiesConstants.PREMIUM_USER, AuthoritiesConstants.ADMIN)

            .antMatchers("/api/account/reset-password/init").permitAll()
            .antMatchers("/api/account/reset-password/finish").permitAll()
            .antMatchers("/api/account/resend-verification").permitAll()
            .antMatchers("/api/account/**").hasAnyAuthority(AuthoritiesConstants.USER)

            .antMatchers("/api/users/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/api/user-details/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/api/tokens/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)
            .antMatchers("/api/token-stats/**").hasAnyAuthority(AuthoritiesConstants.ADMIN)

            .antMatchers("/api/cronjob/**").hasAnyAuthority(AuthoritiesConstants.BOT)

            .antMatchers("/api/**").hasAnyAuthority(AuthoritiesConstants.PUBLIC_WEBSITE, AuthoritiesConstants.USER)

            .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN)
        .and()
            .httpBasic()
        .and()
            .apply(securityConfigurerAdapter());
        // @formatter:on
    }

//    private JWTConfigurer securityConfigurerAdapter() {
//        return new JWTConfigurer(tokenProvider);
//    }

    private UUIDConfigurer securityConfigurerAdapter() {
        return new UUIDConfigurer(tokenProvider, recaptchaValidator);
    }
}
