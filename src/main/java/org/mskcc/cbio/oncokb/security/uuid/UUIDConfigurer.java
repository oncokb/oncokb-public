package org.mskcc.cbio.oncokb.security.uuid;

import com.github.mkopylec.recaptcha.validation.RecaptchaValidator;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

public class UUIDConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    private TokenProvider tokenProvider;

    private RecaptchaValidator recaptchaValidator;

    public UUIDConfigurer(TokenProvider tokenProvider, RecaptchaValidator recaptchaValidator) {
        this.tokenProvider = tokenProvider;
        this.recaptchaValidator = recaptchaValidator;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        UUIDFilter customFilter = new UUIDFilter(tokenProvider, recaptchaValidator);
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
