package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Service for proxying oncokb core requests
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class ApiProxyService {
    private final Logger log = LoggerFactory.getLogger(ApiProxyService.class);

    @Autowired
    private ApplicationProperties applicationProperties;

    public URI prepareURI(HttpServletRequest request) throws URISyntaxException {
        String queryString = request.getQueryString();
        return new URI(applicationProperties.getApiProxyUrl() + request.getRequestURI() + (queryString == null ? "" : "?" + queryString));
    }

    public URI prepareURI(String apiRequest) throws URISyntaxException {
        return new URI(applicationProperties.getApiProxyUrl() + apiRequest);
    }

    public HttpHeaders prepareHttpHeaders(String contentType) {

        HttpHeaders httpHeaders = new HttpHeaders();
        if (contentType != null) {
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
