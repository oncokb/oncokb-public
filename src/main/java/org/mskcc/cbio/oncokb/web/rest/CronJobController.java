package org.mskcc.cbio.oncokb.web.rest;

import io.github.jhipster.security.RandomUtil;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsage;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.*;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.vm.ExposedToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import com.amazonaws.services.dynamodbv2.xspec.NULL;

import java.io.*;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import org.kohsuke.github.*;

import static org.mskcc.cbio.oncokb.config.Constants.DAY_IN_SECONDS;
import static org.mskcc.cbio.oncokb.config.Constants.HALF_YEAR_IN_SECONDS;
import static org.mskcc.cbio.oncokb.domain.enumeration.MailType.TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE;
import static org.mskcc.cbio.oncokb.domain.enumeration.MailType.VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES;

import static java.lang.Thread.sleep;

/**
 * REST controller for managing crobjobs.
 */
@RestController
@RequestMapping("/api/cronjob")
public class CronJobController {

    private final Logger log = LoggerFactory.getLogger(CronJobController.class);

    private final UserService userService;

    private final TokenService tokenService;

    private final TokenStatsService tokenStatsService;

    @Autowired
    private UserMapper userMapper;

    private final MailService mailService;

    private final UserMailsService userMailsService;

    private final TokenProvider tokenProvider;

    private final AuditEventService auditEventService;

    private final ApplicationProperties applicationProperties;

    public CronJobController(UserService userService,
                             MailService mailService, TokenProvider tokenProvider,
                             TokenService tokenService, AuditEventService auditEventService,
                             TokenStatsService tokenStatsService, UserMailsService userMailsService,
                             ApplicationProperties applicationProperties
    ) {

        this.userService = userService;
        this.mailService = mailService;
        this.tokenProvider = tokenProvider;
        this.tokenService = tokenService;
        this.auditEventService = auditEventService;
        this.tokenStatsService = tokenStatsService;
        this.userMailsService = userMailsService;
        this.applicationProperties = applicationProperties;
    }

    /**
     * Old audit events should be automatically deleted after * days.
     * Days depends on JHipster property audit audit-events: retention-period
     */
    @GetMapping(path = "/remove-old-audit-events")
    public void removeOldAuditEvents() {
        auditEventService.removeOldAuditEvents();
    }

    /**
     * Old token stats should be automatically deleted after * days.
     * Days depends on JHipster property audit audit-events: retention-period
     */
    @GetMapping(path = "/remove-old-token-stats")
    public void removeOldTokenStats() {
        tokenStatsService.removeOldTokenStats();
    }

    /**
     * Not activated users should be automatically deleted after * days.
     * Days depends on JHipster property audit audit-events: retention-period
     */
    @GetMapping(path = "/remove-not-activate-users")
    public void removeNotActivatedUsers() {
        // this is not really working due to the foreign key constraints
//        userService.removeNotActivatedUsers();
    }

    /**
     * {@code GET  /renew-tokens} : Checking token expiration.
     */
    @GetMapping(path = "/renew-tokens")
    public void tokensRenewCheck() {
        log.info("Started the cronjob to renew tokens");

        // Since the send email is an async method, we need to record a list of users to prevent sending email multiple times
        Set<String> notifiedUserIds = new HashSet<>();
        int[] timePointsToCheck = new int[]{3, 14};
        for (int daysToExpired : timePointsToCheck) {
            tokenCheckByTime(daysToExpired, notifiedUserIds);
        }
    }

    /**
     * {@code GET  /generate-tokens} : Generate tokens for all users without tokens.
     */
    @GetMapping(path = "/generate-tokens")
    public void generateTokens() {
        log.info("Started the cronjob to generate tokens");
        List<UserDTO> userDTOs = userService.getAllActivatedUsersWithoutTokens();

        // Make sure the token has enough time before sending out the emails to users to verify the email address
        Instant newTokenDefaultExpirationDate = Instant.now().plusSeconds(DAY_IN_SECONDS * 15);
        userDTOs.stream().forEach(userDTO -> {
            Instant expirationDate = userDTO.getCreatedDate() == null ? newTokenDefaultExpirationDate : userDTO.getCreatedDate().plusSeconds(HALF_YEAR_IN_SECONDS);
            tokenProvider.createToken(userMapper.userDTOToUser(userDTO), Optional.of(expirationDate.isBefore(newTokenDefaultExpirationDate) ? newTokenDefaultExpirationDate : expirationDate), Optional.empty());
        });
    }

    /**
     * {@code GET  /update-token-stats} : Update token stats.
     */
    @GetMapping(path = "/update-token-stats")
    public void updateTokenStats() {
        log.info("Started the cronjob to update token stats");
        List<UserTokenUsage> tokenUsages = tokenStatsService.getUserTokenUsage(Instant.now());

        // Update tokens with token usage
        tokenUsages.stream().forEach(tokenUsage -> {
            if (!tokenUsage.getToken().getCurrentUsage().equals(tokenUsage.getCount())) {
                Optional<Token> tokenOptional = tokenService.findByToken(tokenUsage.getToken().getToken());
                if (tokenOptional.isPresent()) {
                    tokenOptional.get().setCurrentUsage(tokenUsage.getCount());
                    tokenService.save(tokenOptional.get());
                }
            }
        });

        // Update tokens without token usage
        List<Long> tokenWithStats = tokenUsages.stream().map(tokenUsage -> tokenUsage.getToken().getId()).collect(Collectors.toList());
        List<Token> tokens = tokenService.findAll().stream().filter(token -> !tokenWithStats.contains(token.getId())).collect(Collectors.toList());
        tokens.stream().forEach(token -> {
            if (!token.getCurrentUsage().equals(0)) {
                token.setCurrentUsage(0);
                tokenService.save(token);
            }
        });
    }

    /**
     * {@code GET  /check-trial-accounts} : Check the status of trial accounts
     */
    @GetMapping(path = "/check-trial-accounts")
    public void checkTrialAccounts() {
        log.info("Started the cronjob to check the status of trial accounts");
        final int DAYS_TO_CHECK = 3;
        List<Token> tokens = tokenService
            .findAllExpiresBeforeDate(Instant.now().plusSeconds(DAY_IN_SECONDS * DAYS_TO_CHECK))
            .stream()
            .filter(token -> !token.isRenewable() && token.getExpiration().isAfter(Instant.now()))
            .filter(token -> {
                // Do not include users that have been notified in the
                return this.userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(token.getUser(), TRIAL_ACCOUNT_IS_ABOUT_TO_EXPIRE, token.getExpiration().minusSeconds(DAY_IN_SECONDS * DAYS_TO_CHECK)).isEmpty();
            })
            .collect(Collectors.toList());
        List<UserDTO> userDTOS = tokens
            .stream()
            .map(token -> userMapper.userToUserDTO(token.getUser()))
            .collect(Collectors.toList());

        mailService.sendTrialAccountExpiresMail(DAYS_TO_CHECK, userDTOS);
    }

    @GetMapping(path = "/check-exposed-tokens")
    public void checkExposedTokens() throws IOException, InterruptedException {
        List<Token> tokens = tokenService
                                .findAll()
                                .stream()
                                .filter(token -> token.getExpiration().isAfter(Instant.now()))
                                .collect(Collectors.toList());
        log.info("Searching exposed tokens pipeline begins...");
        List<ExposedToken> results = new ArrayList<>();
        List<ExposedToken> checkResults = new ArrayList<>();
        boolean googleSearching = true;
        googleSearching = googleSearchingTest();
        boolean baiduSearching = true;
        baiduSearching = baiduSearchingTest();
        for (Token token : tokens){
            String q = token.getToken().toString();

            int githubCount = 0;
            try {
                GitHub github = new GitHubBuilder().withOAuthToken(applicationProperties.getGithubToken()).build();
                List<GHContent> gitRes = github.searchContent().q(q).list().toList();
                githubCount = gitRes.size();
            }
            catch (Exception e) {
                e.printStackTrace();
            }

            int googleCount = 0;
            if (googleSearching){
                try{
                    HttpEntity entity = getGoogleResponse(q).getEntity();
                    Document googleDoc = Jsoup.parse(EntityUtils.toString(entity));
                    Elements resultEle = googleDoc.select("h3");
                    googleCount = resultEle.size();
                    if (googleCount > 0) {
                        String description = googleDoc.select(".kCrYT > div > div > div > div > div").text();
                        if (description.indexOf(q) == -1)
                            googleCount = 0;
                    }
                }
                catch (Exception e){
                    e.printStackTrace();
                }
            }
            
            int baiduCount = 0;
            if (baiduSearching){
                try{
                    Document document = Jsoup.connect(String.format("https://www.baidu.com/s?wd=\"%s\"", q)).get();
                    Elements elements = document.select("div.result.c-container");
                    baiduCount = elements.size();
                }
                catch (Exception e){
                    e.printStackTrace();
                } 
            }         

            if (githubCount > 0){   
                ExposedToken t = new ExposedToken();
                UserDTO user = userMapper.userToUserDTO(token.getUser());
                t.setToken(q);
                t.setEmail(user.getEmail());
                t.setFirstName(user.getFirstName());
                t.setLastName(user.getLastName());
                t.setLicenseType(user.getLicenseType() != null ? user.getLicenseType().name() : "");
                t.setSource("GitHub");   
                results.add(t);

                updateExposedToken(token);
                mailService.sendMailToUserWhenTokenExposed(user, t);
            }
            if (googleCount > 0 || baiduCount > 0){   
                ExposedToken t = new ExposedToken();
                UserDTO user = userMapper.userToUserDTO(token.getUser());
                t.setToken(q);
                t.setEmail(user.getEmail());
                t.setFirstName(user.getFirstName());
                t.setLastName(user.getLastName());
                t.setLicenseType(user.getLicenseType() != null ? user.getLicenseType().name() : "");
                List<String> source = new ArrayList<>();
                if (googleCount > 0){
                    source.add("Google");
                }
                if (baiduCount > 0){
                    source.add("Baidu");
                }
                t.setSource(source.stream().collect(Collectors.joining(", ")));   
                checkResults.add(t);
            }
            sleep(1000);
        }
        log.info("Searching exposed tokens pipeline finished!");
        if (results.size() > 0 || checkResults.size() > 0){
            mailService.sendExposedTokensInfoMail(results, checkResults);
        }
    }

    private HttpResponse getGoogleResponse(String query) {
        String uri = String.format("https://www.google.com/search?q=%s", query);
        HttpClient client = HttpClientBuilder.create().build();
        HttpGet request = new HttpGet(uri);
        HttpResponse result = null;
        try {
          result = client.execute(request);
        } catch (IOException e) {
          e.printStackTrace();
        }
        return result;
    }

    private void updateExposedToken(Token token){
        tokenProvider.createToken(token);
        token.setExpiration(Instant.now());
        tokenService.save(token);
    }

    private boolean googleSearchingTest(){
        try{
            HttpEntity entity = getGoogleResponse("test").getEntity();
            Document googleDoc = Jsoup.parse(EntityUtils.toString(entity));
            Elements resultEle = googleDoc.select("h3");
            if (!resultEle.isEmpty()) {
                Elements descriptionEle = googleDoc.select(".kCrYT > div > div > div > div > div");
                if (descriptionEle.isEmpty()){
                    mailService.sendMailWhenSearchingStructrueChange("Google");
                    return false;
                }
                String description = descriptionEle.text();
                if (description.indexOf("test") == -1){
                    mailService.sendMailWhenSearchingStructrueChange("Google");
                    return false;
                }              
            }
            else{
                mailService.sendMailWhenSearchingStructrueChange("Google");
                return false;
            }
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return true;
    }

    private boolean baiduSearchingTest(){
        try{
            Document document = Jsoup.connect(String.format("https://www.baidu.com/s?wd=\"%s\"", "test")).get();
            Elements elements = document.select("div.result.c-container");
            if (elements.isEmpty()){
                mailService.sendMailWhenSearchingStructrueChange("Baidu");
                return false;
            }
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return true;
    }

    private void tokenCheckByTime(int daysToExpire, Set<String> notifiedUserIds) {
        int secondsToExpire = DAY_IN_SECONDS * daysToExpire;
        List<Token> tokensToBeExpired = tokenService.findAllExpiresBeforeDate(Instant.now().plusSeconds(secondsToExpire));// Only return the users that token is about to expire and no email has been sent before.
        List<User> selectedUsers = new ArrayList<>();

        tokensToBeExpired.forEach(token -> {
            if (token.getUser().getActivated() &&
                // Skip PUBLIC_WEBSITE token since it's short live
                !this.userService.userHasAuthority(token.getUser(), AuthoritiesConstants.PUBLIC_WEBSITE) &&
                !notifiedUserIds.contains(token.getUser().getLogin()) &&
                token.isRenewable() &&
                // Do not include users that have been notified during the validate Token period
                this.userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(token.getUser(), VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES, token.getExpiration().minusSeconds(secondsToExpire)).isEmpty()
            ) {
                selectedUsers.add(token.getUser());
                notifiedUserIds.add(token.getUser().getLogin());
            }
        });
        selectedUsers.stream().distinct().forEach(user -> {
            if (canBeAutoRenew(user)) {
                // For certain users, we should automatically renew the account
                tokensToBeExpired.stream().filter(token -> token.getUser().equals(user)).forEach(token -> renewToken(token));
            } else {
                // Generate an activation key, but only if the activation key is not null, so we would not send emails with different activation key.
                // This is to prevent user clicks on 14 days email when seen 3 days email.
                if (StringUtils.isEmpty(user.getActivationKey())) {
                    userService.generateNewActivationKey(user);
                }

                // Send email to ask user to verify the account ownership
                mailService.sendEmailDeclareEmailOwnership(userMapper.userToUserDTO(user), VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES, daysToExpire);
            }
        });
    }

    private boolean canBeAutoRenew(User user) {
        return userService.userHasAuthority(user, AuthoritiesConstants.ADMIN) ||
            userService.userHasAuthority(user, AuthoritiesConstants.BOT) ||
            (
                !StringUtils.isEmpty(user.getEmail()) && (
                    user.getEmail().endsWith("localhost") ||
                        user.getEmail().endsWith("oncokb.org")
                )
            );
    }

    private void renewToken(Token token) {
        token.setExpiration(token.getExpiration().plusSeconds(tokenProvider.EXPIRATION_TIME_IN_SECONDS));
        tokenService.save(token);
    }
}
