package org.mskcc.cbio.oncokb.config;

import org.mskcc.cbio.oncokb.config.interceptor.RateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class RateLimitConfiguration implements WebMvcConfigurer {

    private final RateLimitInterceptor interceptor;

    public RateLimitConfiguration(RateLimitInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptor)
            // Need to figure out to rate limit people who are causing major issues for us.
            // This is too broad and is impacting users who are using our servers normally.
            //.addPathPatterns("/api/v1/annotate/**")
            //.addPathPatterns("/api/v1/utils/**")
            .addPathPatterns("/api/tokens/**");
    }
}
