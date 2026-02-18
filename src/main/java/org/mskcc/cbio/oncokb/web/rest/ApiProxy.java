package org.mskcc.cbio.oncokb.web.rest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import springfox.documentation.annotations.ApiIgnore;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.annotation.PostConstruct;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApiIgnore("The proxy has its swagger json definition")
@RestController
@RequestMapping("/api")
public class ApiProxy {
    private final Logger log = LoggerFactory.getLogger(ApiProxy.class);

    @Autowired
    private ApiProxyService apiProxyService;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private TokenStatsAsyncService tokenStatsAsyncService;

    @Autowired
    private MailService mailService;

    @Autowired
    private ApplicationProperties applicationProperties;

    private String IP_HEADER = "X-FORWARDED-FOR";
    private List<String> tokenUsageCheckList;
    private List<String> tokenUsageCheckWhitelist;

    @PostConstruct
    private void initTokenUsageCheckWhitelist() {
        tokenUsageCheckList = Arrays.stream(Optional.ofNullable(applicationProperties.getTokenUsageCheck()).orElse("")
                .split(","))
            .map(api -> api.trim())
            .filter(api -> !api.isEmpty())
            .collect(Collectors.toList());
        tokenUsageCheckWhitelist = Arrays.stream(Optional.ofNullable(applicationProperties.getTokenUsageCheckWhitelist()).orElse("")
                .split(","))
            .map(api -> api.trim())
            .filter(api -> !api.isEmpty())
            .collect(Collectors.toList());
    }

    @RequestMapping(path = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.HEAD})
    public ResponseEntity<String> proxy(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);

        boolean needsToBeRecorded = tokenUsageCheckList.stream().anyMatch(api -> request.getRequestURI().startsWith(api));

        if (needsToBeRecorded) {
            recordTokenStats(request, getUsageCount(body, method));
        }

        // We want to record all traffics to /api using public_website token
//        updatePublicWebsiteUsage(body, method);

        HttpHeaders httpHeaders = apiProxyService.prepareHttpHeaders(request.getContentType());
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        try {
            return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class);
        } catch (HttpClientErrorException httpClientErrorException) {
            HttpHeaders responseHeaders = httpClientErrorException.getResponseHeaders();
            return ResponseEntity
                .status(httpClientErrorException.getStatusCode())
                .headers(responseHeaders)
                .body(httpClientErrorException.getResponseBodyAsString());
        }
    }

    @RequestMapping(path = {"/private/utils/data/sqlDump", "/private/utils/data/transcriptSqlDump"})
    public ResponseEntity<byte[]> proxyDataReleaseDownload(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);
        recordTokenStats(request, 1);

        HttpHeaders httpHeaders = apiProxyService.prepareHttpHeaders(request.getContentType());
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(
            new ByteArrayHttpMessageConverter());
        return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), byte[].class);
    }

    @Async
    public void updatePublicWebsiteUsage(String body, HttpMethod method) {
        Optional<String> userOptional = SecurityUtils.getCurrentUserLogin();
        if (userOptional.isPresent()) {
            Optional<User> user = userService.getUserWithAuthoritiesByLogin(userOptional.get());
            if (user.isPresent() &&
                user.get().getAuthorities().stream().filter(authority -> authority.getName().equalsIgnoreCase(AuthoritiesConstants.PUBLIC_WEBSITE)).count() > 0) {
                List<Token> tokenList = tokenProvider.getUserTokens(user.get());
                int usageCount = getUsageCount(body, method);
                tokenList.forEach(token -> {
                    // Check the current public website token usage
                    // Send email if the token usage beyonds the threshold
                    // This is not guaranteed to be triggered if the request is a post and total passes the cutoff
                    // But I think the impact would be minimum
                    if(token.getCurrentUsage() > applicationProperties.getPublicWebsiteApiThreshold() && (token.getCurrentUsage() - applicationProperties.getPublicWebsiteApiThreshold()) % (applicationProperties.getPublicWebsiteApiThreshold() / 4) == 0) {
                        try {
                            mailService.sendEmail(
                                applicationProperties.getEmailAddresses().getTechDevAddress(),
                                applicationProperties.getEmailAddresses().getContactAddress(),
                                null,
                                "Public Website Token exceeds the threshold.",
                                "The Current usage: " + token.getCurrentUsage() + "\n" + "The threshold:" + applicationProperties.getPublicWebsiteApiThreshold(),
                                null,
                                false,
                                false
                            );
                        } catch (MessagingException e) {
                            e.printStackTrace();
                        }
                    }
                });
            }
        }
    }

    private int getUsageCount(String body, HttpMethod method) {
        int usageCount = 1;
        if (method != null && method.equals(HttpMethod.POST)) {
            try {
                Gson gson = new GsonBuilder().create();
                Object[] postRequest = gson.fromJson(body, Object[].class);
                usageCount = postRequest.length;
            }catch (Exception e) {
                // For any reason the request cannot be parsed to a list, we should ignore it and count it as 1
            }
        }
        return usageCount;
    }

    private void recordTokenStats(HttpServletRequest request, int usageCount) {
        if (applicationProperties.getDbReadOnly()) {
            return;
        }
        Optional<String> userOptional = SecurityUtils.getCurrentUserLogin();
        Optional<UUID> uuidOptional = SecurityUtils.getCurrentUserToken();
        if (!userOptional.isPresent() || !uuidOptional.isPresent()) {
            return;
        }
        if (SecurityUtils.isCurrentUserInRole(AuthoritiesConstants.ADMIN)) {
            return;
        }

        if (tokenUsageCheckWhitelist.contains(userOptional.get())) {
            return;
        }

        String ipAddress = request.getHeader(IP_HEADER);
        if (ipAddress == null) {
            ipAddress = Optional.ofNullable(request.getRemoteAddr()).orElse("");
        }
        String resource = request.getMethod() + " " + request.getRequestURI();
        Instant accessTime = Instant.now();

        try {
            tokenStatsAsyncService.saveTokenStats(uuidOptional.get(), ipAddress, resource, usageCount, accessTime);
        } catch (Exception e) {
            log.warn("Saving token stats failed.", e);
        }
    }
    //    @RequestMapping(value = "/private/utils/dataRelease/sqlDump",
//        produces = {"application/zip"},
//        method = RequestMethod.GET)
    public ResponseEntity<byte[]> downloadSqlDump(HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);

        HttpHeaders httpHeaders = apiProxyService.prepareHttpHeaders(request.getContentType());
//        httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity entity = restTemplate.exchange(uri, method, new HttpEntity<>(null, httpHeaders), byte[].class);
            ResponseEntity responseEntity = new ResponseEntity<>((byte[]) entity.getBody(), entity.getHeaders(), entity.getStatusCode());
            return ResponseEntity.ok()
                .contentType(new MediaType("application", "zip"))
                .body((byte[]) entity.getBody());
        } catch (Exception e) {
            return null;
        }
    }
}
