package org.mskcc.cbio.oncokb.web.rest;

import com.sun.xml.bind.v2.TODO;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Authority;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.ApiProxyService;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.service.TokenStatsService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.security.Security;
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
    @Autowired
    private ApiProxyService apiProxyService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private TokenStatsService tokenStatsService;

    @Autowired
    private ApplicationProperties applicationProperties;

    private String IP_HEADER = "X-FORWARDED-FOR";

    @RequestMapping("/**")
    public String proxy(@RequestBody(required = false) String body, HttpMethod method, HttpServletRequest request)
        throws URISyntaxException {
        URI uri = apiProxyService.prepareURI(request);

        List<String> tokenUsageCheckList = Arrays.stream(applicationProperties.getTokenUsageCheck().split(",")).map(api -> api.trim()).filter(api -> !api.isEmpty()).collect(Collectors.toList());
        Optional<String> needsToBeRecorded = tokenUsageCheckList.stream().filter(api -> request.getRequestURI().startsWith(api)).findFirst();
        if (needsToBeRecorded.isPresent()) {
            Optional<String> userOptional = SecurityUtils.getCurrentUserLogin();
            if (userOptional.isPresent()) {
                List<String> tokenUsageCheckWhitelist = Arrays.stream(applicationProperties.getTokenUsageCheckWhitelist().split(",")).map(api -> api.trim()).filter(api -> !api.isEmpty()).collect(Collectors.toList());

                Optional<User> user = userService.getUserWithAuthoritiesByLogin(userOptional.get());
                Optional<UUID> uuidOptional = SecurityUtils.getCurrentUserToken();
                if (user.isPresent() &&
                    user.get().getAuthorities().stream().filter(authority -> authority.getName().equalsIgnoreCase(AuthoritiesConstants.ADMIN)).count() == 0 &&
                    !tokenUsageCheckWhitelist.contains(user.get().getLogin())) {
                    List<Token> tokenList = tokenProvider.getUserTokens(user.get());
                    tokenList.forEach(token -> {
                        token.setCurrentUsage(token.getCurrentUsage() + 1);
                        tokenService.save(token);
                        if (uuidOptional.isPresent() && uuidOptional.get().equals(token.getToken())) {
                            TokenStats tokenStats = new TokenStats();
                            tokenStats.setToken(token);

                            String ipAddress = request.getHeader(IP_HEADER);
                            if (ipAddress == null) {
                                tokenStats.setAccessIp(request.getRemoteAddr());
                            }
                            tokenStats.setAccessTime(Instant.now());
                            tokenStats.setResource(request.getMethod() + " " + request.getRequestURI());
                            tokenStatsService.save(tokenStats);
                        }
                    });
                }
            }
        }
        HttpHeaders httpHeaders = apiProxyService.prepareHttpHeaders(request.getContentType());
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        return restTemplate.exchange(uri, method, new HttpEntity<>(body, httpHeaders), String.class).getBody();
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
