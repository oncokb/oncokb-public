package org.mskcc.cbio.oncokb.config.interceptor;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.RateLimitService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;

class RateLimitInterceptorTest {

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void usesUserLoginWhenAuthenticated() throws Exception {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken("alice", "pw"));
        SecurityContextHolder.setContext(context);

        RateLimitService rateLimitService = mock(RateLimitService.class);
        Bucket bucket = mock(Bucket.class);
        ConsumptionProbe probe = mock(ConsumptionProbe.class);
        when(probe.isConsumed()).thenReturn(true);
        when(probe.getRemainingTokens()).thenReturn(5L);
        when(bucket.tryConsumeAndReturnRemaining(1)).thenReturn(probe);
        when(rateLimitService.resolveBucket(anyString())).thenReturn(bucket);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("1.2.3.4");
        HttpServletResponse response = mock(HttpServletResponse.class);

        RateLimitInterceptor interceptor = new RateLimitInterceptor(rateLimitService);
        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertThat(allowed).isTrue();
        verify(rateLimitService).resolveBucket("user:alice");
    }

    @Test
    void fallsBackToIpWhenAnonymousUser() throws Exception {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(
            "anonymousUser",
            "pw",
            Collections.singletonList(new SimpleGrantedAuthority(AuthoritiesConstants.ANONYMOUS))
        ));
        SecurityContextHolder.setContext(context);

        RateLimitService rateLimitService = mock(RateLimitService.class);
        Bucket bucket = mock(Bucket.class);
        ConsumptionProbe probe = mock(ConsumptionProbe.class);
        when(probe.isConsumed()).thenReturn(true);
        when(probe.getRemainingTokens()).thenReturn(5L);
        when(bucket.tryConsumeAndReturnRemaining(1)).thenReturn(probe);
        when(rateLimitService.resolveBucket(anyString())).thenReturn(bucket);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("2.3.4.5");
        HttpServletResponse response = mock(HttpServletResponse.class);

        RateLimitInterceptor interceptor = new RateLimitInterceptor(rateLimitService);
        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertThat(allowed).isTrue();
        verify(rateLimitService).resolveBucket("ip:2.3.4.5");
    }

    @Test
    void returnsBadRequestWhenNoUserOrIp() throws Exception {
        RateLimitService rateLimitService = mock(RateLimitService.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn(null);
        HttpServletResponse response = mock(HttpServletResponse.class);

        RateLimitInterceptor interceptor = new RateLimitInterceptor(rateLimitService);
        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertThat(allowed).isFalse();
        verify(response).sendError(BAD_REQUEST.value(), "The request cannot be supported as no user or IP Address provided");
        verifyNoInteractions(rateLimitService);
    }

    @Test
    void includesMaxRequestInfoInRateLimitError() throws Exception {
        RateLimitService rateLimitService = mock(RateLimitService.class);
        when(rateLimitService.getConfiguredCapacity()).thenReturn(25L);
        when(rateLimitService.getConfiguredRefillPeriod()).thenReturn(Duration.ofMinutes(2));

        Bucket bucket = mock(Bucket.class);
        ConsumptionProbe probe = mock(ConsumptionProbe.class);
        when(probe.isConsumed()).thenReturn(false);
        when(probe.getNanosToWaitForRefill()).thenReturn(500_000_000L);
        when(bucket.tryConsumeAndReturnRemaining(1)).thenReturn(probe);
        when(rateLimitService.resolveBucket(anyString())).thenReturn(bucket);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("9.9.9.9");
        HttpServletResponse response = mock(HttpServletResponse.class);

        RateLimitInterceptor interceptor = new RateLimitInterceptor(rateLimitService);
        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertThat(allowed).isFalse();
        verify(response).sendError(
            eq(TOO_MANY_REQUESTS.value()),
            contains("Max allowed is 25 requests per 2 minutes.")
        );
    }
}
