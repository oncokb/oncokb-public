package org.mskcc.cbio.oncokb.web.rest;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.TokenStatsAsyncService;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiProxyTest {

    @Mock
    private TokenStatsAsyncService tokenStatsAsyncService;

    @Mock
    private HttpServletRequest request;

    @Captor
    private ArgumentCaptor<Instant> instantCaptor;

    @Test
    void initTokenUsageLists_handlesNullValues() {
        ApiProxy apiProxy = new ApiProxy();
        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setTokenUsageCheck(null);
        applicationProperties.setTokenUsageCheckWhitelist(null);
        ReflectionTestUtils.setField(apiProxy, "applicationProperties", applicationProperties);

        ReflectionTestUtils.invokeMethod(apiProxy, "initTokenUsageCheckWhitelist");

        List<String> tokenUsageCheckList = (List<String>) ReflectionTestUtils.getField(apiProxy, "tokenUsageCheckList");
        List<String> tokenUsageCheckWhitelist = (List<String>) ReflectionTestUtils.getField(apiProxy, "tokenUsageCheckWhitelist");

        assertThat(tokenUsageCheckList).isNotNull().isEmpty();
        assertThat(tokenUsageCheckWhitelist).isNotNull().isEmpty();
    }

    @Test
    void initTokenUsageLists_trimsAndFilters() {
        ApiProxy apiProxy = new ApiProxy();
        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setTokenUsageCheck(" /api , /api/v1 ,,");
        applicationProperties.setTokenUsageCheckWhitelist(" user1, ,user2 ");
        ReflectionTestUtils.setField(apiProxy, "applicationProperties", applicationProperties);

        ReflectionTestUtils.invokeMethod(apiProxy, "initTokenUsageCheckWhitelist");

        List<String> tokenUsageCheckList = (List<String>) ReflectionTestUtils.getField(apiProxy, "tokenUsageCheckList");
        List<String> tokenUsageCheckWhitelist = (List<String>) ReflectionTestUtils.getField(apiProxy, "tokenUsageCheckWhitelist");

        assertThat(tokenUsageCheckList).containsExactly("/api", "/api/v1");
        assertThat(tokenUsageCheckWhitelist).containsExactly("user1", "user2");
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void recordTokenStats_skipsWhenDbReadOnly() {
        ApiProxy apiProxy = buildApiProxy(false, Collections.emptyList());
        ApplicationProperties applicationProperties = (ApplicationProperties) ReflectionTestUtils.getField(apiProxy, "applicationProperties");
        applicationProperties.setDbReadOnly(true);

        setAuthentication("user1", UUID.randomUUID(), AuthoritiesConstants.USER);

        ReflectionTestUtils.invokeMethod(apiProxy, "recordTokenStats", request, 1);

        verifyNoInteractions(tokenStatsAsyncService);
    }

    @Test
    void recordTokenStats_skipsForAdmin() {
        ApiProxy apiProxy = buildApiProxy(false, Collections.emptyList());
        setAuthentication("admin", UUID.randomUUID(), AuthoritiesConstants.ADMIN);

        ReflectionTestUtils.invokeMethod(apiProxy, "recordTokenStats", request, 1);

        verifyNoInteractions(tokenStatsAsyncService);
    }

    @Test
    void recordTokenStats_skipsForWhitelist() {
        ApiProxy apiProxy = buildApiProxy(false, Collections.singletonList("user1"));
        setAuthentication("user1", UUID.randomUUID(), AuthoritiesConstants.USER);

        ReflectionTestUtils.invokeMethod(apiProxy, "recordTokenStats", request, 1);

        verifyNoInteractions(tokenStatsAsyncService);
    }

    @Test
    void recordTokenStats_callsAsyncWithExpectedValues() {
        ApiProxy apiProxy = buildApiProxy(false, Collections.emptyList());
        UUID token = UUID.randomUUID();
        setAuthentication("user1", token, AuthoritiesConstants.USER);

        when(request.getHeader("X-FORWARDED-FOR")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("1.2.3.4");
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/test");

        ReflectionTestUtils.invokeMethod(apiProxy, "recordTokenStats", request, 3);

        verify(tokenStatsAsyncService).saveTokenStats(eq(token), eq("1.2.3.4"), eq("GET /api/test"), eq(3), instantCaptor.capture());
        assertThat(instantCaptor.getValue()).isNotNull();
    }

    @Test
    void recordTokenStats_catchesException() {
        ApiProxy apiProxy = buildApiProxy(false, Collections.emptyList());
        UUID token = UUID.randomUUID();
        setAuthentication("user1", token, AuthoritiesConstants.USER);

        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("5.6.7.8");
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/test");
        doThrow(new RuntimeException("boom")).when(tokenStatsAsyncService)
            .saveTokenStats(eq(token), eq("5.6.7.8"), eq("GET /api/test"), eq(1), any(Instant.class));

        assertThatCode(() -> ReflectionTestUtils.invokeMethod(apiProxy, "recordTokenStats", request, 1))
            .doesNotThrowAnyException();
    }

    private ApiProxy buildApiProxy(boolean dbReadOnly, List<String> whitelist) {
        ApiProxy apiProxy = new ApiProxy();
        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setDbReadOnly(dbReadOnly);
        ReflectionTestUtils.setField(apiProxy, "applicationProperties", applicationProperties);
        ReflectionTestUtils.setField(apiProxy, "tokenStatsAsyncService", tokenStatsAsyncService);
        ReflectionTestUtils.setField(apiProxy, "tokenUsageCheckWhitelist", whitelist);
        return apiProxy;
    }

    private void setAuthentication(String username, UUID token, String role) {
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                username,
                token,
                Arrays.asList(new SimpleGrantedAuthority(role))
            );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
