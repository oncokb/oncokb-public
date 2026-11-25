package org.mskcc.cbio.oncokb.web.rest;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.io.JsonStringEncoder;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.http.conn.ConnectTimeoutException;
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
import org.springframework.web.client.RestClientException;
import org.springframework.util.StreamUtils;
import springfox.documentation.annotations.ApiIgnore;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.annotation.PostConstruct;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.SocketTimeoutException;
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
    private static final String MCP_PATH = "/api/v1/mcp";
    private static final JsonFactory MCP_JSON = new JsonFactory();
    private static final McpMessage EMPTY_MCP_MESSAGE = new McpMessage("null", null);

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

    @RequestMapping(path = "/v1/mcp")
    public ResponseEntity<byte[]> proxyMcp(HttpMethod method, HttpServletRequest request)
        throws IOException, URISyntaxException {
        if (!request.getRequestURI().equals(request.getContextPath() + MCP_PATH)) {
            return ResponseEntity.notFound().build();
        }
        if (method != HttpMethod.POST) {
            return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).allow(HttpMethod.POST).build();
        }
        int limit = applicationProperties.getMcpMaxRequestBytes();
        if (request.getContentLengthLong() > limit) {
            return mcpError(HttpStatus.PAYLOAD_TOO_LARGE, "null", -32003, "MCP request body is too large");
        }
        ByteArrayOutputStream requestBody = new ByteArrayOutputStream();
        // The range includes one extra byte to detect overflow when the size is unknown.
        StreamUtils.copyRange(request.getInputStream(), requestBody, 0, limit);
        if (requestBody.size() > limit) {
            return mcpError(HttpStatus.PAYLOAD_TOO_LARGE, "null", -32003, "MCP request body is too large");
        }

        byte[] body = requestBody.toByteArray();
        McpMessage message = readMcpMessage(body);
        if (message.toolName != null && tokenUsageCheckList.contains(MCP_PATH)) {
            String resource = tokenResource(request) + "#" + message.toolName;
            // The existing usage resource column is varchar(255).
            if (resource.length() <= 255) {
                recordTokenStats(request, 1, resource);
            }
        }
        try {
            return apiProxyService.exchangeMcpRequest(body, request);
        } catch (RestClientException e) {
            if (e.contains(SocketTimeoutException.class) && !e.contains(ConnectTimeoutException.class)) {
                return mcpError(HttpStatus.GATEWAY_TIMEOUT, message.id, -32001, "OncoKB core response timed out");
            }
            return mcpError(HttpStatus.BAD_GATEWAY, message.id, -32000, "OncoKB core request failed");
        }
    }

    private ResponseEntity<byte[]> mcpError(HttpStatus status, String id, int code, String message) {
        String error = "{\"jsonrpc\":\"2.0\",\"id\":" + id
            + ",\"error\":{\"code\":" + code + ",\"message\":\"" + message + "\"}}";
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON)
            .body(error.getBytes(StandardCharsets.UTF_8));
    }

    private McpMessage readMcpMessage(byte[] body) {
        try (JsonParser parser = MCP_JSON.createParser(body)) {
            if (parser.nextToken() != JsonToken.START_OBJECT) {
                return EMPTY_MCP_MESSAGE;
            }
            String version = null;
            String method = null;
            String name = null;
            boolean hasRequestId = false;
            String id = "null";
            while (parser.nextToken() == JsonToken.FIELD_NAME) {
                String field = parser.getCurrentName();
                JsonToken value = parser.nextToken();
                switch (field) {
                    case "jsonrpc":
                        version = value == JsonToken.VALUE_STRING ? parser.getText() : null;
                        break;
                    case "method":
                        method = value == JsonToken.VALUE_STRING ? parser.getText() : null;
                        break;
                    case "id":
                        // A present null ID still executes as a request in the core.
                        hasRequestId = true;
                        id = "null";
                        if (value == JsonToken.VALUE_STRING) {
                            id = "\"" + new String(JsonStringEncoder.getInstance().quoteAsString(parser.getText())) + "\"";
                        } else if (value == JsonToken.VALUE_NUMBER_INT || value == JsonToken.VALUE_NUMBER_FLOAT) {
                            id = parser.getText();
                        }
                        break;
                    case "params":
                        name = readMcpToolName(parser);
                        break;
                    default:
                        break;
                }
                parser.skipChildren();
            }
            if (parser.currentToken() == JsonToken.END_OBJECT && parser.nextToken() == null && "2.0".equals(version)) {
                String toolName = "tools/call".equals(method) && hasRequestId && name != null && !name.trim().isEmpty()
                    ? name : null;
                return new McpMessage(id, toolName);
            }
        } catch (IOException e) {
            // The core server handles malformed JSON-RPC bodies.
        }
        return EMPTY_MCP_MESSAGE;
    }

    private static class McpMessage {
        private final String id;
        private final String toolName;

        McpMessage(String id, String toolName) {
            this.id = id;
            this.toolName = toolName;
        }
    }

    private String readMcpToolName(JsonParser parser) throws IOException {
        String name = null;
        if (parser.currentToken() == JsonToken.START_OBJECT) {
            while (parser.nextToken() == JsonToken.FIELD_NAME) {
                String field = parser.getCurrentName();
                JsonToken value = parser.nextToken();
                if ("name".equals(field)) {
                    name = value == JsonToken.VALUE_STRING ? parser.getText() : null;
                }
                parser.skipChildren();
            }
        }
        return name;
    }

    @RequestMapping(path = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.HEAD})
    public ResponseEntity<String> proxy(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);

        boolean needsToBeRecorded = tokenUsageCheckList.stream()
            .filter(api -> !MCP_PATH.equals(api))
            .anyMatch(api -> request.getRequestURI().startsWith(api));

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
                            log.error("Failed to send email for public website token usage alert", e);
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
        recordTokenStats(request, usageCount, tokenResource(request));
    }

    private String tokenResource(HttpServletRequest request) {
        return request.getMethod() + " " + request.getRequestURI();
    }

    private void recordTokenStats(HttpServletRequest request, int usageCount, String resource) {
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
