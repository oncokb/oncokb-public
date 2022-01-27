package org.mskcc.cbio.oncokb.web.rest;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.*;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsage;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsageWithInfo;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.*;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.vm.ExposedToken;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.ResourceModel;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageSummary;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserUsage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.json.simple.JSONObject;

import org.kohsuke.github.*;

import static org.mskcc.cbio.oncokb.config.Constants.*;
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

    private final UserDetailsRepository userDetailsRepository;

    @Autowired
    private UserMapper userMapper;

    private final S3Service s3Service;

    private final MailService mailService;

    private final UserMailsService userMailsService;

    private final TokenProvider tokenProvider;

    private final AuditEventService auditEventService;

    private final ApplicationProperties applicationProperties;

    public CronJobController(UserService userService,
                             MailService mailService, TokenProvider tokenProvider,
                             TokenService tokenService, AuditEventService auditEventService,
                             TokenStatsService tokenStatsService, UserMailsService userMailsService,
                             ApplicationProperties applicationProperties, UserDetailsRepository userDetailsRepository,
                             S3Service s3Service
    ) {

        this.userService = userService;
        this.mailService = mailService;
        this.tokenProvider = tokenProvider;
        this.tokenService = tokenService;
        this.auditEventService = auditEventService;
        this.tokenStatsService = tokenStatsService;
        this.userMailsService = userMailsService;
        this.applicationProperties = applicationProperties;
        this.userDetailsRepository = userDetailsRepository;
        this.s3Service = s3Service;
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
     * Not activated users should be automatically deleted after * days.
     * Days depends on JHipster property audit audit-events: retention-period
     */
    @GetMapping(path = "/remove-not-activate-users")
    public void removeNotActivatedUsers() {
        // this is not really working due to the foreign key constraints
//        userService.removeNotActivatedUsers();
    }

    /**
     * A list of not activated users should be emailed to the team every Monday.
     */
    @GetMapping(path = "/email-unapproved-users-list")
    public void emailUnapprovedUsersList() {
        final int DAYS_AGO = 7;
        List<UserMessagePair> users = userService.getAllUnapprovedUsersCreatedAfter(DAYS_AGO);
        mailService.sendUnapprovedUsersEmail(DAYS_AGO, users);
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
     * {@code GET /user-usage-analysis}: Analyze user usage
     *
     * @throws IOException
     */
    @GetMapping(path = "/user-usage-analysis")
    public void analyzeUserUsage() throws IOException {
        log.info("User usage analysis started...");
        List<UserTokenUsageWithInfo> tokenStats = tokenStatsService.getTokenUsageAnalysis(Instant.now().minus(365, ChronoUnit.DAYS));
        UsageSummary resourceSummary = new UsageSummary();
        Map<Long, UserUsage> userSummary = new HashMap<>();
        Map<String, UsageSummary> resourceDetail = new HashMap<>();

        for (UserTokenUsageWithInfo state : tokenStats) {
            ResourceModel resource = new ResourceModel(state.getResource());
            String endpoint = resource.getEndpoint();
            int count = state.getCount();
            String time = state.getTime();

            // Deal with resource summary
            calculateUsageSummary(resourceSummary, endpoint, count, time);

            // Deal with user usage
            long userId = state.getToken().getUser().getId();
            User user = state.getToken().getUser();
            if (!userSummary.containsKey(userId)) {
                userSummary.put(userId, new UserUsage());
                UserUsage currentUsage = userSummary.get(userId);
                currentUsage.setUserFirstName(user.getFirstName());
                currentUsage.setUserLastName(user.getLastName());
                currentUsage.setUserEmail(user.getEmail());
                currentUsage.setSummary(new UsageSummary());
                Optional<UserDetails> userDetails = userDetailsRepository.findOneByUser(user);
                if (userDetails.isPresent()) {
                    currentUsage.setJobTitle(userDetails.get().getJobTitle());
                    currentUsage.setCompany(userDetails.get().getCompanyName());
                    currentUsage.setLicenseType(userDetails.get().getLicenseType().getName());
                }
            }
            UsageSummary currentUsageSummary = userSummary.get(userId).getSummary();
            calculateUsageSummary(currentUsageSummary, endpoint, count, time);

            // Deal with resource detail
            if (!resourceDetail.containsKey(endpoint)) {
                resourceDetail.put(endpoint, new UsageSummary());
            }
            String userEmail = user.getEmail();
            calculateUsageSummary(resourceDetail.get(endpoint), userEmail, count, time);
        }

        ObjectMapper mapper = new ObjectMapper();
        File resourceResult = new File("./resourceSummary.json");
        File userResult = new File("./userSummary.json");
        File resourceDetailResult = new File("./resourceDetail.json");
        mapper.writeValue(resourceResult, resourceSummary);
        mapper.writeValue(userResult, userSummary);
        mapper.writeValue(resourceDetailResult, resourceDetail);

        s3Service.saveObject("oncokb", RESOURCES_USAGE_SUMMARY_FILE, resourceResult);
        s3Service.saveObject("oncokb", USERS_USAGE_SUMMARY_FILE, userResult);
        s3Service.saveObject("oncokb", RESOURCES_USAGE_DETAIL_FILE, resourceDetailResult);
        resourceResult.delete();
        userResult.delete();
        resourceDetailResult.delete();
        log.info("User usage analysis completed!");
    }

    /**
     * {@code GET /wrap-token-stats}: Wrap token stats
     *
     * @throws IOException
     */
    @GetMapping(path="move-token-stats-to-s3")
    public void moveTokenStatsToS3() throws IOException {
        log.info("Started the cronjob to move token stats to s3.");

        Instant tokenUsageDateBefore = Instant.now().truncatedTo(ChronoUnit.DAYS);

        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            String datedFile = TOKEN_STATS_STORAGE_FILE_PREFIX + dateFormat.format(dateFormat.parse(tokenUsageDateBefore.toString())) + ".zip";
            if (s3Service.getObject("oncokb", datedFile).isPresent()) {
                log.info("Token stats have already been wrapped today. Skipping this request.");
            } else {
                // Update tokenStats in database
                updateTokenStats(tokenUsageDateBefore);
                // Send tokenStats to s3
                s3Service.saveObject("oncokb", datedFile, createWrappedFile(tokenUsageDateBefore, dateFormat.format(dateFormat.parse(tokenUsageDateBefore.toString())) + ".txt"));
                // Delete old tokenStats
                tokenStatsService.clearTokenStats(tokenUsageDateBefore);
            }
        } catch (ParseException e) {
            log.error("Unable to parse instant. Java.time.Instant formatting may have changed.");
        }

        log.info("Finished the cronjob to move token stats to s3.");
    }

    private void calculateUsageSummary(UsageSummary usageSummary, String key, int count, String time) {
        // Deal with year summary
        usageSummary.getYear().put(key, usageSummary.getYear().getOrDefault(key, 0) + count);
        // Deal with month summary
        if (!usageSummary.getMonth().containsKey(time)) {
            usageSummary.getMonth().put(time, new JSONObject());
        }
        if (!usageSummary.getMonth().get(time).containsKey(key)) {
            usageSummary.getMonth().get(time).put(key, new Integer(0));
        }
        usageSummary.getMonth().get(time).put(key, (Integer) usageSummary.getMonth().get(time).get(key) + (Integer) count);
    }

    /**
     * {@code GET  /check-trial-accounts} : Check the status of trial accounts
     */
    @GetMapping(path = "/check-trial-accounts")
    public void checkTrialAccounts() {
        log.info("Started the cronjob to check the status of trial accounts");
        final int DAYS_TO_CHECK = 7;
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

    /**
     * Check if user tokens has been exposed on Internet.
     *
     * @throws IOException
     * @throws InterruptedException
     * @author Yifu Yao
     */
    @GetMapping(path = "/check-exposed-tokens")
    public void checkExposedTokens() throws IOException, InterruptedException {
        // Get all tokens from database
        List<Token> tokens = tokenService
            .findAll()
            .stream()
            .filter(token -> token.getExpiration().isAfter(Instant.now()))
            .collect(Collectors.toList());
        log.info("Searching exposed tokens pipeline begins...");
        List<ExposedToken> results = new ArrayList<>();
        List<ExposedToken> unverifiedResults = new ArrayList<>();

        // Check each token
        for (Token token : tokens) {
            String q = token.getToken().toString();

            // If can be found on GitHub.
            int githubCount = 0;
            try {
                GitHub github = new GitHubBuilder().withOAuthToken(applicationProperties.getGithubToken()).build();
                List<GHContent> gitRes = github.searchContent().q(q).list().toList();
                githubCount = gitRes.size();
            } catch (Exception e) {
                e.printStackTrace();
            }

            UserDTO user = userMapper.userToUserDTO(token.getUser());
            // If token was found on GitHub, update it with a new token and send email to user.
            if (githubCount > 0) {
                ExposedToken t = generateExposedToken(token, user, "GitHub");
                results.add(t);
                updateExposedToken(token);
                mailService.sendMailToUserWhenTokenExposed(user, t);
            }
            sleep(1000);
        }
        log.info("Searching exposed tokens pipeline finished!");
        // If any potential exposed tokens were be found, send notification to dev team.
        if (!results.isEmpty() || !unverifiedResults.isEmpty()) {
            mailService.sendExposedTokensInfoMail(results, unverifiedResults);
        }
    }

    /**
     * Generate a object with all information of an exposed token. Used to send email.
     *
     * @param token
     * @param user
     * @param source
     * @return
     */
    private ExposedToken generateExposedToken(Token token, UserDTO user, String source) {
        ExposedToken t = new ExposedToken();
        t.setToken(token.getToken().toString());
        t.setEmail(user.getEmail());
        t.setFirstName(user.getFirstName());
        t.setLastName(user.getLastName());
        t.setLicenseType(user.getLicenseType() != null ? user.getLicenseType().name() : "");
        t.setSource(source);
        return t;
    }

    /**
     * Create a new token for exposed one
     *
     * @param token
     */
    private void updateExposedToken(Token token) {
        tokenProvider.createToken(token);
        token.setExpiration(Instant.now());
        tokenService.save(token);
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

    private void updateTokenStats(Instant tokenUsageDateBefore) {
        log.info("Started the cronjob to update token stats");
        List<UserTokenUsage> tokenUsages = tokenStatsService.getUserTokenUsage(tokenUsageDateBefore);

        // Update tokens with token usage
        tokenUsages.stream().forEach(tokenUsage -> {
            Optional<Token> tokenOptional = tokenService.findByToken(tokenUsage.getToken().getToken());
            if (tokenOptional.isPresent()) {
                tokenOptional.get().setCurrentUsage(tokenOptional.get().getCurrentUsage() + tokenUsage.getCount());
                tokenService.save(tokenOptional.get());
            }
        });
        log.info("Finished the cronjob to update token stats");
    }

    private File createWrappedFile(Instant tokenUsageDateBefore, String fileName) throws IOException {
        File file = File.createTempFile("token-stats-", ".zip");
        file.deleteOnExit();
        ZipOutputStream out = new ZipOutputStream(new FileOutputStream(file));
        ZipEntry entry = new ZipEntry(fileName);
        out.putNextEntry(entry);

        int PAGE_SIZE = 2;
        int totalPages = tokenStatsService.findAll(tokenUsageDateBefore, PageRequest.of(0, PAGE_SIZE)).getTotalPages();
        String headers = TokenStats.csvHeaders() + "\n";
        byte[] headersInBytes = headers.getBytes();
        out.write(headersInBytes, 0, headersInBytes.length);
        for (int page = 0; page < totalPages; page++) {
            for (TokenStats tokenStats : tokenStatsService.findAll(tokenUsageDateBefore, PageRequest.of(page, PAGE_SIZE))) {
                String row = tokenStats.toCSV() + "\n";
                byte[] rowInBytes = row.getBytes();
                out.write(rowInBytes, 0, rowInBytes.length);
            }
        }
        out.closeEntry();
        out.close();

        return file;
    }
}
