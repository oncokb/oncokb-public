package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.config.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;

@ApiIgnore("The proxy has its swagger json definition")
@RestController
@RequestMapping("/api")
public class ApiProxy {

    private final Logger log = LoggerFactory.getLogger(ApiProxy.class);

    @Autowired
    private ApplicationProperties applicationProperties;

    @RequestMapping("/**")
    public String proxy(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        String queryString = request.getQueryString();
        URI uri = new URI(applicationProperties.getApiProxyUrl() + request.getRequestURI() + (queryString == null ? "" : "?" + queryString));
        log.info(uri.getPath());

        HttpHeaders httpHeaders = new HttpHeaders();
        String contentType = request.getHeader("Content-Type");
        if (contentType != null) {
            httpHeaders.setContentType(MediaType.valueOf(contentType));
        }

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class).getBody();
    }
}
