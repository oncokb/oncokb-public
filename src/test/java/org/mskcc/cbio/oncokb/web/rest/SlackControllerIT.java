package org.mskcc.cbio.oncokb.web.rest;

import com.google.gson.Gson;
import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.TextObject;
import com.slack.api.util.json.GsonFactory;
import com.slack.api.webhook.Payload;
import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.security.RandomUtil;
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
import org.mskcc.cbio.oncokb.service.impl.TokenServiceImpl;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
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

    @Captor
    private ArgumentCaptor<String> urlCaptor;

    @Captor
    private ArgumentCaptor<Payload> payloadCaptor;

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
    void setUp() throws IOException {
        MockitoAnnotations.initMocks(this);
        doReturn(null).when(slack).send(urlCaptor.capture(), payloadCaptor.capture());
        doNothing().when(javaMailSender).send(messageCaptor.capture());

        // Specify webhook address for testing
        applicationProperties.setSlack(new SlackProperties());
        applicationProperties.getSlack().setUserRegistrationWebhook(USER_REGISTRATION_WEBHOOK);

        // specify application emails for testing
        applicationProperties.setEmailAddresses(new EmailAddresses());
        applicationProperties.getEmailAddresses().setLicenseAddress(LICENSE_ADDR);
        applicationProperties.getEmailAddresses().setContactAddress(CONTACT_ADDR);
        applicationProperties.getEmailAddresses().setRegistrationAddress(REGISTRATION_ADDR);
        applicationProperties.getEmailAddresses().setTechDevAddress(TECH_DEV_ADDR);
        jHipsterProperties.getMail().setFrom(DEFAULT_ADDR);

        mailService = new MailService(jHipsterProperties, javaMailSender, messageSource, templateEngine, userMailsService, applicationProperties);
        slackService = new SlackService(applicationProperties, mailService, emailService, userMailsService, userMapper, slack);
        slackController = new SlackController(userService, userRepository, mailService, slackService, userMapper);
    }

    @Test
    void testApproveUser() throws IOException, MessagingException {
        // Create mock user
        User mockUser = new User();
        mockUser.setLogin("john.doe@example.com");
        mockUser.setEmail("john.doe@example.com");
        mockUser.setPassword(passwordEncoder.encode(RandomUtil.generatePassword()));
        mockUser.setLangKey("en");
        mockUser.setActivated(false);
        userRepository.save(mockUser);

        // Add mock user details
        UserDetails mockUserDetails = new UserDetails().user(mockUser);
        mockUserDetails.setCompanyName("company name");
        mockUserDetails.setLicenseType(LicenseType.COMMERCIAL);
        userDetailsRepository.save(mockUserDetails);

        // Mock payload
        BlockActionPayload actionJSON = new BlockActionPayload();
        List<BlockActionPayload.Action> actions = new ArrayList<>();
        BlockActionPayload.Action approveAction = new BlockActionPayload.Action();
        approveAction.setActionId(ActionId.APPROVE_USER.getId());
        approveAction.setValue("john.doe@example.com");
        actions.add(approveAction);
        actionJSON.setActions(actions);
        actionJSON.setResponseUrl(USER_REGISTRATION_WEBHOOK);
        actionJSON.setToken("token");

        // Mock approve user
        Gson snakeCase = GsonFactory.createSnakeCase();
        slackController.approveUser(snakeCase.toJson(actionJSON));
        MimeMessage message = messageCaptor.getValue();
        String url = urlCaptor.getValue();
        Payload payload = payloadCaptor.getValue();

        // Check mail integration
        assertThat(message.getSubject()).isEqualTo(messageSource.getMessage(MailType.APPROVAL.getTitleKey(), new Object[]{}, Locale.forLanguageTag(mockUser.getLangKey())));
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("john.doe@example.com");
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent()).isInstanceOf(String.class);
        assertThat(message.getContent().toString()).contains(getStringFromResourceTemplateMailTextFile(MailType.APPROVAL.getStringTemplateName().get()).trim());

        // Check Slack integration
        assertThat(url).isEqualTo(USER_REGISTRATION_WEBHOOK);
        Set<String> expectedValues = new HashSet<>();
        expectedValues.add(LicenseType.COMMERCIAL.getName());
        expectedValues.add("john.doe@example.com");
        expectedValues.add("company name");
        expectedValues.add(LicenseType.COMMERCIAL.getName());
        expectedValues.add(BlockId.COLLAPSED.getId());
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

        // Check user approval
        mockUser = userRepository.findOneWithAuthoritiesByLogin("john.doe@example.com").orElse(null);
        assertThat(mockUser).isNotNull();
        assertThat(mockUser.getActivated()).isTrue();
        List<Token> mockTokens = tokenService.findByUser(mockUser);
        assertThat(mockTokens).isNotEmpty();
        Token mockToken = mockTokens.get(0);
        assertThat(mockToken.getExpiration()).isBefore(Instant.now().plusSeconds(DEFAULT_TOKEN_EXPIRATION_IN_SECONDS + 1));
        assertThat(mockToken.isRenewable()).isTrue();
        assertThat(userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(mockUser, MailType.APPROVAL, null)).isNotEmpty();
    }

    @Test
    void testGiveTrialAccess() throws IOException {

    }

    @Test
    void testChangeLicenseType() throws IOException {

    }

    @Test
    void testConvertToRegularAccount() throws IOException {

    }

    @Test
    void testDropdownEmailOptions() throws IOException {

    }

    private String getStringFromResourceTemplateMailTextFile(String fileName) throws IOException {
        StringBuilder sb = new StringBuilder();

        URL targetFileUrl = getClass().getClassLoader().getResource("templates/mail/" + fileName);
        if (targetFileUrl != null) {
            try (Stream<String> stream = Files.lines(Paths.get(targetFileUrl.getPath()), StandardCharsets.UTF_8)) {
                stream.forEach(s -> sb.append(s).append("\n"));
            }
        }

        return sb.toString();
    }
}
