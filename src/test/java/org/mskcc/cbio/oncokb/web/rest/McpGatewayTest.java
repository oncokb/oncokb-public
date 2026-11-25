package org.mskcc.cbio.oncokb.web.rest;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.github.jhipster.config.JHipsterProperties;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mskcc.cbio.oncokb.config.RateLimitConfiguration;
import org.mskcc.cbio.oncokb.config.TokenSecurityConfiguration;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.interceptor.RateLimitInterceptor;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.DomainUserDetailsService;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.ApiProxyService;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.RateLimitService;
import org.mskcc.cbio.oncokb.service.TokenStatsAsyncService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.web.rest.errors.ExceptionTranslator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.StreamUtils;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringJUnitConfig(McpGatewayTest.Config.class)
@WebAppConfiguration
@TestPropertySource(properties = "jhipster.clientApp.name=oncokbPublicApp")
class McpGatewayTest {
    private static final String PATH = "/api/v1/mcp";
    private static final String JSON = "application/json;charset=UTF-8";
    private static final byte[] ERROR = "{\"jsonrpc\":\"2.0\",\"error\":{\"code\":-32602,\"message\":\"Invalid params\"}}"
        .getBytes(StandardCharsets.UTF_8);
    private static final BlockingQueue<CoreRequest> CORE_REQUESTS = new LinkedBlockingQueue<>();
    private static HttpServer core;

    @Autowired
    private WebApplicationContext context;

    @MockBean
    private TokenProvider tokenProvider;

    @MockBean
    private TokenStatsAsyncService tokenStats;

    @MockBean
    private DomainUserDetailsService domainUserDetailsService;

    @MockBean
    private MailService mailService;

    @MockBean
    private UserService userService;

    private MockMvc mvc;

    @BeforeEach
    void setup() {
        CORE_REQUESTS.clear();
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterAll
    static void stopCore() {
        if (core != null) {
            core.stop(0);
        }
    }

    @Test
    void rejectsAnonymous() throws Exception {
        mvc.perform(post(PATH)).andExpect(status().isUnauthorized());
        mvc.perform(get(PATH)).andExpect(status().isUnauthorized());
        mvc.perform(delete(PATH)).andExpect(status().isUnauthorized());
        mvc.perform(options(PATH)).andExpect(status().isUnauthorized());
        assertThat(CORE_REQUESTS).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {AuthoritiesConstants.PUBLIC_WEBSITE, AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN})
    void rejectsOtherBearerTokens(String role) throws Exception {
        mvc.perform(request(token(role), "")).andExpect(status().isForbidden());
        assertThat(CORE_REQUESTS).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {AuthoritiesConstants.API, AuthoritiesConstants.ROLE_SERVICE_ACCOUNT})
    void permitsAnnotationRolesOnExactPath(String role) throws Exception {
        UUID token = token(role);
        mvc.perform(request(token, "")).andExpect(status().isAccepted());
        mvc.perform(post(PATH + "/other").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        assertThat(CORE_REQUESTS).hasSize(1);
    }

    @Test
    void rejectsTrailingSlashAliasForAdmin() throws Exception {
        mvc.perform(post(PATH + "/").header("Authorization", "Bearer " + token(AuthoritiesConstants.ADMIN)))
            .andExpect(status().isNotFound());
        assertThat(CORE_REQUESTS).isEmpty();
    }

    @Test
    void rejectsUnsupportedMethodsWithoutCallingCore() throws Exception {
        String authorization = "Bearer " + token(AuthoritiesConstants.API);
        mvc.perform(get(PATH).header("Authorization", authorization))
            .andExpect(status().isMethodNotAllowed()).andExpect(header().string("Allow", "POST"));
        mvc.perform(delete(PATH).header("Authorization", authorization)).andExpect(status().isMethodNotAllowed());
        assertThat(CORE_REQUESTS).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(ints = {200, 400, 500})
    void preservesBodyProtocolHeadersAndUpstreamStatus(int upstreamStatus) throws Exception {
        UUID token = token(AuthoritiesConstants.API);
        byte[] body = (" { \"jsonrpc\":\"2.0\", \"method\":\"ping\", \"params\":{\"sample\":\"β\"} }\n")
            .getBytes(StandardCharsets.UTF_8);
        mvc.perform(post(PATH).queryParam("status", String.valueOf(upstreamStatus))
                .header("Authorization", "Bearer " + token).contentType(JSON)
                .header("Accept", "application/json, text/event-stream")
                .header("MCP-Protocol-Version", "2025-03-26")
                .header("Mcp-Session-Id", "session-1").content(body))
            .andExpect(status().is(upstreamStatus)).andExpect(header().string("Content-Type", JSON))
            .andExpect(content().bytes(ERROR));
        CoreRequest upstream = CORE_REQUESTS.poll(1, TimeUnit.SECONDS);
        assertThat(upstream.body).isEqualTo(body);
        assertThat(upstream.contentType).isEqualTo(JSON);
        assertThat(upstream.accept).isEqualTo("application/json, text/event-stream");
        assertThat(upstream.protocolVersion).isEqualTo("2025-03-26");
        assertThat(upstream.sessionId).isEqualTo("session-1");
        assertThat(upstream.authorization).isNull();
    }

    @Test
    void preservesEmptyAcceptedResponse() throws Exception {
        mvc.perform(request(token(AuthoritiesConstants.API), "{}")).andExpect(status().isAccepted())
            .andExpect(content().bytes(new byte[0])).andExpect(header().doesNotExist("Content-Type"));
        assertThat(CORE_REQUESTS.poll(1, TimeUnit.SECONDS).sessionId).isNull();
    }

    @Test
    void rateLimitsEachUserIndependently() throws Exception {
        UUID token = token(AuthoritiesConstants.API);
        mvc.perform(request(token, "")).andExpect(status().isAccepted())
            .andExpect(header().string("x-ratelimit-remaining", "1"));
        mvc.perform(request(token, "")).andExpect(status().isAccepted());
        mvc.perform(request(token, "")).andExpect(status().isTooManyRequests())
            .andExpect(header().exists("x-ratelimit-reset"));
        mvc.perform(request(token(AuthoritiesConstants.API), "")).andExpect(status().isAccepted());
        assertThat(CORE_REQUESTS).hasSize(3);
    }

    @Test
    void recordsOneUnitPerToolUsingExistingResourceFormat() throws Exception {
        UUID token = token(AuthoritiesConstants.API);
        for (String tool : new String[] {"annotate_mutation", "get_levels"}) {
            String body = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"" + tool + "\"}}";
            mvc.perform(request(token, body)).andExpect(status().isAccepted());
            verify(tokenStats).saveTokenStats(eq(token), eq("127.0.0.1"), eq("POST " + PATH + "#" + tool), eq(1), any());
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}",
        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}",
        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"ping\"}",
        "{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}",
        "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":{\"name\":\"a\"}}",
        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":123}}",
        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"a\"}} {}",
        "[{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"a\"}}]",
        "{malformed", " ", "", "null"
    })
    void excludesNonToolMessagesAndForwardsMalformedBodies(String body) throws Exception {
        mvc.perform(request(token(AuthoritiesConstants.API), body)).andExpect(status().isAccepted());
        verifyNoInteractions(tokenStats);
        assertThat(CORE_REQUESTS.poll(1, TimeUnit.SECONDS).body).isEqualTo(body.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void forwardsDeeplyNestedMalformedBodyWithoutRecordingUsage() throws Exception {
        String nested = String.join("", Collections.nCopies(20000, "["));
        String body = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"a\",\"arguments\":" + nested;
        mvc.perform(request(token(AuthoritiesConstants.API), body)).andExpect(status().isAccepted());
        verifyNoInteractions(tokenStats);
        assertThat(CORE_REQUESTS.poll(1, TimeUnit.SECONDS).body).isEqualTo(body.getBytes(StandardCharsets.UTF_8));
    }

    private UUID token(String role) {
        UUID token = UUID.randomUUID();
        when(tokenProvider.validateToken(token)).thenReturn(true);
        when(tokenProvider.getAuthentication(token)).thenReturn(new UsernamePasswordAuthenticationToken(
            token.toString(), token, Collections.singleton(new SimpleGrantedAuthority(role))));
        return token;
    }

    private MockHttpServletRequestBuilder request(UUID token, String body) {
        return post(PATH).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static class CoreRequest {
        private final byte[] body;
        private final String contentType;
        private final String accept;
        private final String protocolVersion;
        private final String sessionId;
        private final String authorization;

        CoreRequest(HttpExchange exchange) throws IOException {
            body = StreamUtils.copyToByteArray(exchange.getRequestBody());
            contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            accept = exchange.getRequestHeaders().getFirst("Accept");
            protocolVersion = exchange.getRequestHeaders().getFirst("MCP-Protocol-Version");
            sessionId = exchange.getRequestHeaders().getFirst("Mcp-Session-Id");
            authorization = exchange.getRequestHeaders().getFirst("Authorization");
        }
    }

    @Configuration
    @EnableWebMvc
    @Import({TokenSecurityConfiguration.class, RateLimitConfiguration.class, RateLimitInterceptor.class,
        ApiProxy.class, ApiProxyService.class, ExceptionTranslator.class})
    static class Config {
        @Bean
        ApplicationProperties applicationProperties() throws IOException {
            core = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            core.createContext(PATH, exchange -> {
                try {
                    CORE_REQUESTS.add(new CoreRequest(exchange));
                    String query = exchange.getRequestURI().getQuery();
                    if (query == null) {
                        exchange.sendResponseHeaders(202, -1);
                    } else {
                        exchange.getResponseHeaders().set("Content-Type", JSON);
                        exchange.sendResponseHeaders(Integer.parseInt(query.substring("status=".length())), ERROR.length);
                        exchange.getResponseBody().write(ERROR);
                    }
                } finally {
                    exchange.close();
                }
            });
            core.start();

            ApplicationProperties properties = new ApplicationProperties();
            properties.setApiProxyUrl("http://127.0.0.1:" + core.getAddress().getPort());
            properties.setTokenUsageCheck(PATH);
            properties.setDbReadOnly(false);
            properties.getRateLimit().setCapacity(2);
            properties.getRateLimit().setRefillPeriod(Duration.ofHours(1));
            return properties;
        }

        @Bean
        RateLimitService rateLimitService(ApplicationProperties properties) {
            return new RateLimitService(Optional.empty(), null, new JHipsterProperties(), properties);
        }

        @Bean
        CorsFilter corsFilter() {
            return new CorsFilter(new UrlBasedCorsConfigurationSource());
        }
    }
}
