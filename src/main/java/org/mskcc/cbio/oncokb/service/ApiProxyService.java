package org.mskcc.cbio.oncokb.service;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.impl.client.HttpClients;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PreDestroy;
import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;

/**
 * Service for proxying oncokb core requests
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class ApiProxyService {
    private final Logger log = LoggerFactory.getLogger(ApiProxyService.class);

    private static final String[] MCP_REQUEST_HEADERS = {
        HttpHeaders.CONTENT_TYPE, HttpHeaders.ACCEPT, "MCP-Protocol-Version", "Mcp-Session-Id"
    };

    private final HttpComponentsClientHttpRequestFactory mcpRequestFactory = createMcpRequestFactory();
    private final RestTemplate mcpClient = createMcpClient(mcpRequestFactory);

    private static HttpComponentsClientHttpRequestFactory createMcpRequestFactory() {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(
            HttpClients.custom()
                .setMaxConnPerRoute(20)
                .disableRedirectHandling()
                .disableAutomaticRetries()
                .disableCookieManagement()
                .build());
        factory.setConnectTimeout(5000);
        factory.setConnectionRequestTimeout(5000);
        factory.setReadTimeout(30000);
        return factory;
    }

    @PreDestroy
    private void closeMcpClient() throws Exception {
        mcpRequestFactory.destroy();
    }

    private static RestTemplate createMcpClient(HttpComponentsClientHttpRequestFactory factory) {
        RestTemplate client = new RestTemplate(factory);
        client.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) {
                return false;
            }

            @Override
            public void handleError(ClientHttpResponse response) {
                // MCP clients receive upstream errors as ordinary proxy responses.
            }
        });
        return client;
    }

    public ResponseEntity<byte[]> exchangeMcpRequest(byte[] body, HttpServletRequest request) throws URISyntaxException {
        return mcpClient.execute(prepareURI(request), HttpMethod.POST, upstream -> {
            for (String header : MCP_REQUEST_HEADERS) {
                Collections.list(request.getHeaders(header)).forEach(value -> upstream.getHeaders().add(header, value));
            }
            if (body != null) {
                StreamUtils.copy(body, upstream.getBody());
            }
        }, upstream -> {
            ResponseEntity.BodyBuilder response = ResponseEntity.status(upstream.getRawStatusCode());
            String contentType = upstream.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
            if (contentType != null) {
                response.header(HttpHeaders.CONTENT_TYPE, contentType);
            }
            byte[] responseBody = StreamUtils.copyToByteArray(upstream.getBody());
            return response.body(responseBody.length == 0 ? null : responseBody);
        });
    }

    @Autowired
    private ApplicationProperties applicationProperties;

    public URI prepareURI(HttpServletRequest request) throws URISyntaxException {
        String queryString = request.getQueryString();
        String defaultApiProxyUrl = applicationProperties.getApiProxyUrl();
        return new URI(defaultApiProxyUrl + request.getRequestURI() + (queryString == null ? "" : "?" + queryString));
    }

    public URI prepareURI(String apiRequest) throws URISyntaxException {
        return new URI(applicationProperties.getApiProxyUrl() + apiRequest);
    }

    public HttpHeaders prepareHttpHeaders(String contentType) {

        HttpHeaders httpHeaders = new HttpHeaders();
        if (StringUtils.isNotEmpty(contentType)) {
            httpHeaders.setContentType(MediaType.valueOf(contentType));
        }

        return httpHeaders;
    }

    public ResponseEntity<String> exchangeRequest(String body, HttpMethod method, String contentType, String apiRequest) throws URISyntaxException {
        URI uri = prepareURI(apiRequest);

        HttpHeaders httpHeaders = prepareHttpHeaders(contentType);
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class);
    }
}
