package org.mskcc.cbio.oncokb.web.rest;

import com.google.gson.Gson;
import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.app_backend.views.payload.ViewSubmissionPayload;
import com.slack.api.methods.MethodsClient;
import com.slack.api.methods.SlackApiException;
import com.slack.api.methods.request.views.ViewsOpenRequest;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.TextObject;
import com.slack.api.model.view.View;
import com.slack.api.model.view.ViewState;
import com.slack.api.util.json.GsonFactory;
import com.slack.api.webhook.Payload;
import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.security.RandomUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.EmailAddresses;
import org.mskcc.cbio.oncokb.config.application.SlackProperties;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.*;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.TrialAccount;
import org.mskcc.cbio.oncokb.service.impl.TokenServiceImpl;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.mskcc.cbio.oncokb.web.rest.slack.DropdownEmailOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mskcc.cbio.oncokb.config.Constants.DEFAULT_TOKEN_EXPIRATION_IN_SECONDS;

@SpringBootTest(classes = OncokbPublicApp.class)
public class SlackControllerIT {

    // Testing Slack url and email addresses for applicationProperties
    private static final String USER_REGISTRATION_WEBHOOK =  "https://hooks.slack.com/example";
    private static final String LICENSE_ADDR = "license@example.com";
    private static final String REGISTRATION_ADDR = "registration@example.com";
    private static final String CONTACT_ADDR = "contact@example.com";
    private static final String TECH_DEV_ADDR = "dev@example.com";
    private static final String DEFAULT_ADDR = "default@example.com";

    // Mock fields for test user
    private static final String DEFAULT_USER_FIRST_NAME = "Jon";
    private static final String DEFAULT_USER_LAST_NAME = "Doe";
    private static final String DEFAULT_USER_EMAIL = "john.doe@example.com";
    private static final String DEFAULT_LANG_KEY = "en";
    private static final String DEFAULT_COMPANY_NAME = "company name";
    private static final LicenseType DEFAULT_LICENSE_TYPE = LicenseType.COMMERCIAL;
    private static final LicenseType OTHER_LICENSE_TYPE = LicenseType.ACADEMIC;

    // Mock fields for Slack payload
    private static final String DEFAULT_PAYLOAD_TOKEN = "token";
    private static final String DEFAULT_OAUTH_TOKEN = "oauth_token";
    private static final String DEFAULT_TRIGGER_ID = "trigger_id";

    // Mock email contents
    private static final String DEFAULT_EMAIL_SUBJECT = "email subject";
    private static final String DEFAULT_EMAIL_BODY = "email body";

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private MailService mailService;
    @Autowired
    private JHipsterProperties jHipsterProperties;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private SpringTemplateEngine templateEngine;
    @Autowired
    private UserMailsService userMailsService;

    private SlackService slackService;
    @Autowired
    private EmailService emailService;

    @Autowired
    private UserMapper userMapper;

    @Spy
    private Slack slack;

    @Spy
    private SentryService sentryService;

    @Spy
    private MethodsClient methodsClient;

    @Captor
    private ArgumentCaptor<String> urlCaptor;

    @Captor
    private ArgumentCaptor<Payload> payloadCaptor;

    @Captor
    private ArgumentCaptor<ViewsOpenRequest> requestCaptor;

    @Spy
    private JavaMailSenderImpl javaMailSender;

    @Captor
    private ArgumentCaptor<MimeMessage> messageCaptor;

    @Autowired
    private TokenServiceImpl tokenService;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private SlackController slackController;

    @BeforeEach
    void setUp() throws IOException, SlackApiException {

        /******************************
         * Set up app properties
         ******************************/

        // Specify webhook address for testing
        applicationProperties.setSlack(new SlackProperties());
        applicationProperties.getSlack().setUserRegistrationWebhook(USER_REGISTRATION_WEBHOOK);
        applicationProperties.getSlack().setSlackBotOauthToken(DEFAULT_OAUTH_TOKEN);

        // Specify application emails for testing
        applicationProperties.setEmailAddresses(new EmailAddresses());
        applicationProperties.getEmailAddresses().setLicenseAddress(LICENSE_ADDR);
        applicationProperties.getEmailAddresses().setContactAddress(CONTACT_ADDR);
        applicationProperties.getEmailAddresses().setRegistrationAddress(REGISTRATION_ADDR);
        applicationProperties.getEmailAddresses().setTechDevAddress(TECH_DEV_ADDR);
        jHipsterProperties.getMail().setFrom(DEFAULT_ADDR);

        /******************************
         * Mock dependencies
         ******************************/

        // Set up mock dependencies
        MockitoAnnotations.initMocks(this);
        doReturn(null).when(slack).send(urlCaptor.capture(), payloadCaptor.capture());
        when(slack.methods()).thenReturn(methodsClient);
        doReturn(null).when(methodsClient).viewsOpen(requestCaptor.capture());
        doNothing().when(javaMailSender).send(messageCaptor.capture());

        // Inject mock dependencies
        mailService = new MailService(jHipsterProperties, javaMailSender, messageSource, templateEngine, userMailsService, applicationProperties);
        slackService = new SlackService(applicationProperties, mailService, userService, userMailsService, userMapper, slack, sentryService);
        slackController = new SlackController(userService, userRepository, mailService, slackService, userMapper);

        /******************************
         * Create mock test user
         ******************************/

        // Create mock user
        User mockUser = new User();
        mockUser.setFirstName(DEFAULT_USER_FIRST_NAME);
        mockUser.setLastName(DEFAULT_USER_LAST_NAME);
        mockUser.setLogin(DEFAULT_USER_EMAIL);
        mockUser.setEmail(DEFAULT_USER_EMAIL);
        mockUser.setPassword(passwordEncoder.encode(RandomUtil.generatePassword()));
        mockUser.setLangKey(DEFAULT_LANG_KEY);
        mockUser.setActivated(false);
        userRepository.save(mockUser);

        // Add mock user details
        UserDetails mockUserDetails = new UserDetails().user(mockUser);
        mockUserDetails.setCompanyName(DEFAULT_COMPANY_NAME);
        mockUserDetails.setLicenseType(DEFAULT_LICENSE_TYPE);
        userDetailsRepository.save(mockUserDetails);
    }

    @AfterEach
    void tearDown() {
        userService.deleteUser(DEFAULT_USER_EMAIL);
    }

    @Test
    void testApproveUser() throws IOException, MessagingException {

        /*******************************
         * Mock user approval
         *******************************/

        BlockActionPayload actionJSON = getBlockActionPayload(ActionId.APPROVE_USER);
        Gson snakeCase = GsonFactory.createSnakeCase();
        slackController.approveUser(snakeCase.toJson(actionJSON));
        MimeMessage message = messageCaptor.getValue();
        String url = urlCaptor.getValue();
        Payload payload = payloadCaptor.getValue();

        /*******************************
         * Run checks
         *******************************/

        // Check mail integration
        checkEmail(message, MailType.APPROVAL);

        // Check Slack integration
        checkSlackBlock(url, payload, ActionId.APPROVE_USER, true);

        // Check user approval
        User mockUser = userRepository.findOneWithAuthoritiesByLogin(DEFAULT_USER_EMAIL).orElse(null);
        assertThat(mockUser).isNotNull();
        assertThat(mockUser.getActivated()).isTrue();

        // Check user token
        List<Token> mockTokens = tokenService.findByUser(mockUser);
        assertThat(mockTokens).isNotEmpty();
        Token mockToken = mockTokens.get(0);
        assertThat(mockToken.getExpiration()).isBefore(Instant.now().plusSeconds(DEFAULT_TOKEN_EXPIRATION_IN_SECONDS + 1));
        assertThat(mockToken.isRenewable()).isTrue();

        // Check user mails
        assertThat(userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(mockUser, MailType.APPROVAL, null)).isNotEmpty();

        /*******************************
         * Test expanding block
         *******************************/

        BlockActionPayload expandJSON = getBlockActionPayload(ActionId.EXPAND);
        slackController.approveUser(snakeCase.toJson(expandJSON));
        String expandUrl = urlCaptor.getValue();
        Payload expandPayload = payloadCaptor.getValue();
        checkSlackBlock(expandUrl, expandPayload, ActionId.APPROVE_USER, false);
    }

    @Test
    void testGiveTrialAccess() throws IOException, MessagingException {

        /*******************************
         * Mock giving trial access
         *******************************/

        BlockActionPayload actionJSON = getBlockActionPayload(ActionId.GIVE_TRIAL_ACCESS);
        Gson snakeCase = GsonFactory.createSnakeCase();
        slackController.approveUser(snakeCase.toJson(actionJSON));
        MimeMessage message = messageCaptor.getValue();
        String url = urlCaptor.getValue();
        Payload payload = payloadCaptor.getValue();

        /*******************************
         * Run Checks
         *******************************/

        // Check mail integration
        checkEmail(message, MailType.ACTIVATE_FREE_TRIAL);

        // Check Slack integration
        checkSlackBlock(url, payload, ActionId.GIVE_TRIAL_ACCESS, true);

        // Check user properties
        User mockUser = userRepository.findOneWithAuthoritiesByLogin(DEFAULT_USER_EMAIL).orElse(null);
        assertThat(mockUser).isNotNull();
        assertThat(mockUser.getActivated()).isFalse();

        // Check trial account properties
        UserDTO mockUserDTO = userMapper.userToUserDTO(mockUser);
        TrialAccount mockTrialAccount = mockUserDTO.getAdditionalInfo().getTrialAccount();
        assertThat(mockTrialAccount).isNotNull();
        assertThat(mockTrialAccount.getActivation().getInitiationDate()).isBefore(Instant.now().plusSeconds(1));
        assertThat(mockTrialAccount.getActivation().getKey().length()).isGreaterThan(0);

        // Check that no user token was created
        List<Token> mockTokens = tokenService.findByUser(mockUser);
        assertThat(mockTokens).isEmpty();

        // Check user mails
        assertThat(userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(mockUser, MailType.ACTIVATE_FREE_TRIAL, null)).isNotEmpty();

        /*******************************
         * Test expanding block
         *******************************/

        BlockActionPayload expandJSON = getBlockActionPayload(ActionId.EXPAND);
        slackController.approveUser(snakeCase.toJson(expandJSON));
        String expandUrl = urlCaptor.getValue();
        Payload expandPayload = payloadCaptor.getValue();
        checkSlackBlock(expandUrl, expandPayload, ActionId.GIVE_TRIAL_ACCESS, false);

        /*******************************
         * Test converting to regular
         *******************************/
        userService.finishTrialAccountActivation(mockTrialAccount.getActivation().getKey());
        testConvertToRegularAccount();
    }

    void testConvertToRegularAccount() throws IOException, MessagingException {

        /*******************************
         * Mock converting to regular
         *******************************/

        BlockActionPayload actionJSON = getBlockActionPayload(ActionId.CONVERT_TO_REGULAR_ACCOUNT);
        Gson snakeCase = GsonFactory.createSnakeCase();
        slackController.approveUser(snakeCase.toJson(actionJSON));
        String url = urlCaptor.getValue();
        Payload payload = payloadCaptor.getValue();

        /*******************************
         * Run checks
         *******************************/

        // Check Slack integration
        checkSlackBlock(url, payload, ActionId.CONVERT_TO_REGULAR_ACCOUNT, true);

        // Check user approval
        User mockUser = userRepository.findOneWithAuthoritiesByLogin(DEFAULT_USER_EMAIL).orElse(null);
        assertThat(mockUser).isNotNull();
        assertThat(mockUser.getActivated()).isTrue();

        // Check user token
        List<Token> mockTokens = tokenService.findByUser(mockUser);
        assertThat(mockTokens).isNotEmpty();
        Token mockToken = mockTokens.get(0);
        assertThat(mockToken.getExpiration()).isBefore(Instant.now().plusSeconds(DEFAULT_TOKEN_EXPIRATION_IN_SECONDS + 1));
        assertThat(mockToken.isRenewable()).isTrue();

        /*******************************
         * Test expanding block
         *******************************/

        BlockActionPayload expandJSON = getBlockActionPayload(ActionId.EXPAND);
        slackController.approveUser(snakeCase.toJson(expandJSON));
        String expandUrl = urlCaptor.getValue();
        Payload expandPayload = payloadCaptor.getValue();
        checkSlackBlock(expandUrl, expandPayload, ActionId.CONVERT_TO_REGULAR_ACCOUNT, false);
    }

    @Test
    void testChangeLicenseType() throws IOException, MessagingException {

        /*******************************
         * Mock giving trial access
         *******************************/

        BlockActionPayload actionJSON = getBlockActionPayload(ActionId.CHANGE_LICENSE_TYPE);
        Gson snakeCase = GsonFactory.createSnakeCase();
        slackController.approveUser(snakeCase.toJson(actionJSON));
        String url = urlCaptor.getValue();
        Payload payload = payloadCaptor.getValue();

        /*******************************
         * Run Checks
         *******************************/

        // Check Slack integration
        checkSlackBlock(url, payload, ActionId.CHANGE_LICENSE_TYPE, false);

        // Check user properties
        User mockUser = userRepository.findOneWithAuthoritiesByLogin(DEFAULT_USER_EMAIL).orElse(null);
        assertThat(mockUser).isNotNull();
        assertThat(mockUser.getActivated()).isFalse();
        assertThat(userMapper.userToUserDTO(mockUser).getLicenseType()).isEqualTo(OTHER_LICENSE_TYPE);

        /*******************************
         * Test collapsing block
         *******************************/

        BlockActionPayload expandJSON = getBlockActionPayload(ActionId.COLLAPSE);
        slackController.approveUser(snakeCase.toJson(expandJSON));
        String collapseUrl = urlCaptor.getValue();
        Payload collapsePayload = payloadCaptor.getValue();
        checkSlackBlock(collapseUrl, collapsePayload, ActionId.CHANGE_LICENSE_TYPE, true);
    }

    @Test
    void testDropdownEmailOptions() throws IOException, MessagingException {
        for (DropdownEmailOption option : Arrays.stream(DropdownEmailOption.values()).filter(option -> !option.isNotModalEmail()).collect(Collectors.toList())) {

            /*******************************
             * Mock converting to regular
             *******************************/

            BlockActionPayload actionJSON = getBlockActionPayload(option.getActionId());
            Gson snakeCase = GsonFactory.createSnakeCase();
            slackController.approveUser(snakeCase.toJson(actionJSON));
            ViewsOpenRequest request = requestCaptor.getValue();

            /*******************************
             * Run checks
             *******************************/

            // Check Slack integration
            checkSlackModal(request, option);
        }
    }

    @Test
    void testSendInputModalEmails() throws IOException, MessagingException, NullPointerException {
        for (DropdownEmailOption option : Arrays.stream(DropdownEmailOption.values()).filter(option -> !option.isNotModalEmail()).collect(Collectors.toList())) {

            /*******************************
             * Mock sending input modals
             *******************************/

            ViewSubmissionPayload viewJSON = getViewSubmissionPayload(option);
            Gson snakeCase = GsonFactory.createSnakeCase();
            slackController.approveUser(snakeCase.toJson(viewJSON));
            MimeMessage message = messageCaptor.getValue();
            String url = urlCaptor.getValue();
            Payload payload = payloadCaptor.getValue();

            /*******************************
             * Run checks
             *******************************/

            // Check mail integration
            checkEmail(message, option.getMailType());

            // Check Slack integration
            checkSlackBlock(url, payload, option.getConfirmActionId().orElseThrow(NullPointerException::new), true);

            // Check user mails
            User mockUser = userRepository.findOneWithAuthoritiesByLogin(DEFAULT_USER_EMAIL).orElse(null);
            assertThat(userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(mockUser, option.getMailType(), null)).isNotEmpty();

            /*******************************
             * Test expanding block
             *******************************/

            BlockActionPayload expandJSON = getBlockActionPayload(ActionId.EXPAND);
            slackController.approveUser(snakeCase.toJson(expandJSON));
            String expandUrl = urlCaptor.getValue();
            Payload expandPayload = payloadCaptor.getValue();
            checkSlackBlock(expandUrl, expandPayload, option.getConfirmActionId().orElseThrow(NullPointerException::new), false);
        }

    }

    private BlockActionPayload getBlockActionPayload(ActionId actionId) {
        BlockActionPayload actionJSON = new BlockActionPayload();

        // Set specific action
        List<BlockActionPayload.Action> actions = new ArrayList<>();
        BlockActionPayload.Action action = new BlockActionPayload.Action();
        if (ActionId.isDropdownAction(actionId)) {
            action.setActionId(ActionId.MORE_ACTIONS.getId());
        } else {
            action.setActionId(actionId.getId());
        }
        BlockActionPayload.Action.SelectedOption option = new BlockActionPayload.Action.SelectedOption();
        if (actionId == ActionId.CHANGE_LICENSE_TYPE) {
            option.setValue(slackService.getOptionValue(OTHER_LICENSE_TYPE.toString(), DEFAULT_USER_EMAIL));
        } else {
            option.setValue(slackService.getOptionValue(actionId.toString(), DEFAULT_USER_EMAIL));
        }
        action.setSelectedOption(option);
        action.setValue(DEFAULT_USER_EMAIL);
        actions.add(action);
        if (ActionId.isModalEmailAction(actionId)) {
            actionJSON.setTriggerId(DEFAULT_TRIGGER_ID);
        }
        actionJSON.setActions(actions);

        // Set webhook url
        actionJSON.setResponseUrl(USER_REGISTRATION_WEBHOOK);

        // Set payload token
        actionJSON.setToken(DEFAULT_PAYLOAD_TOKEN);

        return actionJSON;
    }

    private ViewSubmissionPayload getViewSubmissionPayload(DropdownEmailOption option) throws NullPointerException{
        ViewSubmissionPayload viewJSON = new ViewSubmissionPayload();

        viewJSON.setToken(DEFAULT_PAYLOAD_TOKEN);

        List<ViewSubmissionPayload.ResponseUrl> responseUrls = new ArrayList<>();
        ViewSubmissionPayload.ResponseUrl responseUrl = new ViewSubmissionPayload.ResponseUrl();
        responseUrl.setResponseUrl(USER_REGISTRATION_WEBHOOK);
        viewJSON.setResponseUrls(responseUrls);

        ViewSubmissionPayload.User user = new ViewSubmissionPayload.User();
        user.setName(DEFAULT_ADDR);
        viewJSON.setUser(user);

        View view = new View();
        view.setPrivateMetadata(slackService.getOptionValue(USER_REGISTRATION_WEBHOOK, DEFAULT_USER_EMAIL));
        view.setCallbackId(option.getConfirmActionId().orElseThrow(NullPointerException::new).getId());
        ViewState viewState = new ViewState();
        Map<String, Map<String, ViewState.Value>> values = new HashMap<>();
        Map<String, ViewState.Value> subjectMap = new HashMap<>();
        ViewState.Value subjectValue = new ViewState.Value();
        subjectValue.setValue(DEFAULT_EMAIL_SUBJECT);
        subjectMap.put(ActionId.INPUT_SUBJECT.getId(), subjectValue);
        Map<String, ViewState.Value> bodyMap = new HashMap<>();
        ViewState.Value bodyValue = new ViewState.Value();
        bodyValue.setValue(DEFAULT_EMAIL_BODY);
        bodyMap.put(ActionId.INPUT_BODY.getId(), bodyValue);
        values.put(BlockId.SUBJECT_INPUT.getId(), subjectMap);
        values.put(BlockId.BODY_INPUT.getId(), bodyMap);
        viewState.setValues(values);
        view.setState(viewState);
        viewJSON.setView(view);

        return viewJSON;
    }

    private void checkSlackBlock(String url, Payload payload, ActionId actionId, boolean collapsed) {
        assertThat(url).isEqualTo(USER_REGISTRATION_WEBHOOK);

        // Add required values
        Set<String> expectedValues = new HashSet<>();
        expectedValues.add(DEFAULT_USER_EMAIL);
        expectedValues.add(DEFAULT_COMPANY_NAME);
        if (collapsed) {
            expectedValues.add(BlockId.COLLAPSED.getId());
            expectedValues.add(actionId == ActionId.CHANGE_LICENSE_TYPE ? OTHER_LICENSE_TYPE.getShortName() : DEFAULT_LICENSE_TYPE.getShortName());
            if (actionId == ActionId.GIVE_TRIAL_ACCESS) {
                expectedValues.add("TRIAL");
            } else {
                for (DropdownEmailOption option : DropdownEmailOption.values()) {
                    if (option.getActionId() == actionId && option.getCollapsedNote().isPresent()) {
                        expectedValues.add(option.getCollapsedNote().get());
                    }
                }
            }
        } else {
            expectedValues.add(actionId == ActionId.CHANGE_LICENSE_TYPE ? OTHER_LICENSE_TYPE.getName() : DEFAULT_LICENSE_TYPE.getName());
            if (actionId == ActionId.APPROVE_USER) {
                expectedValues.add(SlackService.APPROVE_USER_EXPANDED_NOTE);
            } else if (actionId == ActionId.CONVERT_TO_REGULAR_ACCOUNT) {
                expectedValues.add(SlackService.CONVERT_TO_REGULAR_ACCOUNT_EXPANDED_NOTE);
            } else {
                for (DropdownEmailOption option : DropdownEmailOption.values()) {
                    if (option.getConfirmActionId() == Optional.of(actionId)) {
                        expectedValues.add(option.getExpandedNote());
                    }
                }
            }
        }

        // Search for required values
        for (LayoutBlock block : payload.getBlocks()) {
            if (block instanceof SectionBlock) {
                SectionBlock sectionBlock = (SectionBlock) block;
                if (sectionBlock.getText() != null) {
                    expectedValues.removeIf(sectionBlock.getText().getText()::contains);
                }
                if (sectionBlock.getFields() != null) {
                    for (TextObject textObject : sectionBlock.getFields()) {
                        expectedValues.removeIf(textObject.getText()::contains);
                    }
                }
                if (sectionBlock.getBlockId() != null) {
                    expectedValues.removeIf(sectionBlock.getBlockId()::contains);
                }
            }
        }

        assertThat(expectedValues).isEmpty();
    }

    private void checkSlackModal(ViewsOpenRequest request, DropdownEmailOption option) {
        assertThat(request.getToken()).isEqualTo(DEFAULT_OAUTH_TOKEN);
        assertThat(request.getTriggerId()).isEqualTo(DEFAULT_TRIGGER_ID);

        View view = request.getView();
        assertThat(view.getCallbackId()).isEqualTo(option.getConfirmActionId().orElseThrow(NullPointerException::new).getId());
        assertThat(view.getType()).isEqualTo("modal");
        assertThat(view.getPrivateMetadata()).isEqualTo(slackService.getOptionValue(USER_REGISTRATION_WEBHOOK, DEFAULT_USER_EMAIL));
        assertThat(view.getTitle().getText()).isEqualTo(option.getModalTitle().orElseThrow(NullPointerException::new));
    }

    private void checkEmail(MimeMessage message, MailType mailType) throws IOException, MessagingException {
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(DEFAULT_USER_EMAIL);
        if (mailType == MailType.LICENSE_OPTIONS) {
            assertThat(message.getFrom()[0].toString()).isEqualTo(LICENSE_ADDR);
        } else if (mailType == MailType.ACTIVATE_FREE_TRIAL) {
            assertThat(message.getFrom()[0].toString()).isEqualTo(DEFAULT_ADDR);
        } else if (MailType.isDropdownEmail(mailType)) {
            assertThat(message.getFrom()[0].toString()).isEqualTo(REGISTRATION_ADDR);
        } else {
            assertThat(message.getFrom()[0].toString()).isEqualTo(DEFAULT_ADDR);
        }

        assertThat(message.getContent()).isInstanceOf(String.class);
        for (DropdownEmailOption option : DropdownEmailOption.values()) {
            if (option.getMailType().equals(mailType) && !option.isNotModalEmail()) {
                assertThat(message.getContent().toString()).isEqualTo(DEFAULT_EMAIL_BODY);
                assertThat(message.getSubject()).isEqualTo(DEFAULT_EMAIL_SUBJECT);
            }
        }
    }
}
