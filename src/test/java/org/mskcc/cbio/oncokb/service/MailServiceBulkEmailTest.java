package org.mskcc.cbio.oncokb.service;

import io.github.jhipster.config.JHipsterProperties;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SendGridProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.BulkEmailAudience;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridMailRequest;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSendResult;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.thymeleaf.spring5.SpringTemplateEngine;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MailServiceBulkEmailTest {

    @Mock
    private JavaMailSenderImpl javaMailSender;

    @Mock
    private MessageSource messageSource;

    @Mock
    private SpringTemplateEngine templateEngine;

    @Mock
    private UserMailsService userMailsService;

    @Mock
    private TokenService tokenService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDetailsRepository userDetailsRepository;

    @Mock
    private TokenRepository tokenRepository;

    @Captor
    private ArgumentCaptor<UserMailsDTO> userMailsCaptor;

    private MailService mailService;
    private ApplicationProperties applicationProperties;
    private SendGridService sendGridService;

    @BeforeEach
    void setUp() {
        JHipsterProperties jHipsterProperties = new JHipsterProperties();
        applicationProperties = new ApplicationProperties();
        applicationProperties.setSendgrid(new SendGridProperties());
        sendGridService = mock(SendGridService.class);
        mailService = new MailService(
            jHipsterProperties,
            javaMailSender,
            messageSource,
            templateEngine,
            userMailsService,
            tokenService,
            userRepository,
            userDetailsRepository,
            applicationProperties,
            sendGridService
        );
    }

    @AfterEach
    void tearDown() {
        // no-op
    }

    @Test
    void sendBulkEmailWithLicenseContext_throwsWhenSendGridDisabled() {
        doReturn(false).when(sendGridService).isConfigured();
        UserDTO user = user(1L, "user1", "user1@example.org");

        assertThatThrownBy(() ->
            mailService.sendBulkEmailWithLicenseContext(
                Collections.singletonList(user),
                "no-reply@oncokb.org",
                null,
                "admin",
                BulkEmailAudience.DEVELOPERS,
                null
            )
        )
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("SendGrid bulk email is not enabled. Please contact the dev team.");
    }

    @Test
    void sendBulkEmailWithLicenseContext_throwsWhenBulkTypeConfigMissing() {
        enableSendGrid("http://localhost:65535");
        doReturn(true).when(sendGridService).isConfigured();

        UserDTO user = user(1L, "user1", "user1@example.org");

        assertThatThrownBy(() ->
            mailService.sendBulkEmailWithLicenseContext(
                Collections.singletonList(user),
                "no-reply@oncokb.org",
                null,
                "admin",
                BulkEmailAudience.DEVELOPERS,
                null
            )
        )
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Bulk email type DEVELOPERS is not configured. Please contact the dev team.");
    }

    @Test
    void sendBulkEmailWithLicenseContext_doesNotIncludeAsmWhenAsmGroupIdMissing() throws Exception {
        enableSendGrid("http://localhost:65535");
        doReturn(true).when(sendGridService).isConfigured();
        configureNewsTemplate("d-news-template");
        configureNewsTemplateNoUnsubscribe("d-news-template-no-unsubscribe");
        configureBulkType(BulkEmailAudience.DEVELOPERS, null);

        SendGridSendResult result = new SendGridSendResult();
        result.setStatusCode(202);
        doReturn(result).when(sendGridService).sendTemplatedMail(any(SendGridMailRequest.class));

        UserDTO recipient = user(8L, "no-asm-user", "no-asm-user@example.org");

        String response = mailService.sendBulkEmailWithLicenseContext(
            Collections.singletonList(recipient),
            "no-reply@oncokb.org",
            null,
            "admin",
            BulkEmailAudience.DEVELOPERS,
            null
        );

        assertThat(response).isEqualTo("Queued 1 emails via SendGrid for audience DEVELOPERS.");
    }

    @Test
    void sendBulkEmailWithLicenseContext_throwsWhenNoValidRecipients() {
        enableSendGrid("http://localhost:65535");

        assertThatThrownBy(() ->
            mailService.sendBulkEmailWithLicenseContext(
                Arrays.asList(null, user(1L, "u1", "   "), user(2L, "u2", null)),
                "no-reply@oncokb.org",
                null,
                "admin",
                BulkEmailAudience.DEVELOPERS,
                null
            )
        )
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("No valid recipients were provided.");
    }

    @Test
    void sendBulkEmailWithLicenseContext_successfulSendGridPath() throws Exception {
        enableSendGrid("http://localhost:65535");
        doReturn(true).when(sendGridService).isConfigured();
        configureBulkType(BulkEmailAudience.SCIENTIFIC_NEWS, 123L);
        configureNewsTemplate("d-template");

        SendGridSendResult result = new SendGridSendResult();
        result.setStatusCode(202);
        doReturn(result).when(sendGridService).sendTemplatedMail(any(SendGridMailRequest.class));

        UserDTO recipient = user(1L, "user1", "user1@example.org");

        String response = mailService.sendBulkEmailWithLicenseContext(
            Collections.singletonList(recipient),
            "no-reply@oncokb.org",
            "cc@example.org",
            "admin",
            BulkEmailAudience.SCIENTIFIC_NEWS,
            null
        );

        assertThat(response).isEqualTo("Queued 1 emails via SendGrid for audience SCIENTIFIC_NEWS.");
        verify(userMailsService, times(1)).save(userMailsCaptor.capture());
        assertThat(userMailsCaptor.getValue().getUserId()).isEqualTo(1L);
        assertThat(userMailsCaptor.getValue().getMailType()).isEqualTo(MailType.BULK_SCIENTIFIC_NEWS);
        assertThat(userMailsCaptor.getValue().getSentFrom()).isEqualTo("no-reply@oncokb.org");
        assertThat(userMailsCaptor.getValue().getSentBy()).isEqualTo("admin");
    }

    @Test
    void sendBulkEmailWithLicenseContext_usesNewsTemplateForDevelopersAudience() throws Exception {
        enableSendGrid("http://localhost:65535");
        doReturn(true).when(sendGridService).isConfigured();
        configureBulkType(BulkEmailAudience.DEVELOPERS, 222L);
        configureNewsTemplate("d-news-template");

        SendGridSendResult result = new SendGridSendResult();
        result.setStatusCode(202);
        doReturn(result).when(sendGridService).sendTemplatedMail(any(SendGridMailRequest.class));

        UserDTO recipient = user(2L, "dev-user", "dev-user@example.org");

        String response = mailService.sendBulkEmailWithLicenseContext(
            Collections.singletonList(recipient),
            "no-reply@oncokb.org",
            null,
            "admin",
            BulkEmailAudience.DEVELOPERS,
            null
        );

        assertThat(response).isEqualTo("Queued 1 emails via SendGrid for audience DEVELOPERS.");
        verify(userMailsService, times(1)).save(userMailsCaptor.capture());
        assertThat(userMailsCaptor.getValue().getMailType()).isEqualTo(MailType.BULK_DEVELOPERS);
    }

    @Test
    void sendBulkEmailWithLicenseContext_includesDynamicContentInTemplateData() throws Exception {
        enableSendGrid("http://localhost:65535");
        doReturn(true).when(sendGridService).isConfigured();
        configureBulkType(BulkEmailAudience.CUSTOM, 333L);
        configureNewsTemplate("d-news-template");

        SendGridSendResult result = new SendGridSendResult();
        result.setStatusCode(202);
        doReturn(result).when(sendGridService).sendTemplatedMail(any(SendGridMailRequest.class));

        Map<String, Object> dynamicContent = new LinkedHashMap<>();
        dynamicContent.put("title", "Developer News");
        dynamicContent.put("today", "August 3, 2026");
        dynamicContent.put("firstName", "Wrong");
        dynamicContent.put("lastName", "Person");

        UserDTO recipient = user(3L, "custom-user", "custom-user@example.org");

        mailService.sendBulkEmailWithLicenseContext(
            Collections.singletonList(recipient),
            "no-reply@oncokb.org",
            null,
            "admin",
            BulkEmailAudience.CUSTOM,
            dynamicContent
        );

        ArgumentCaptor<SendGridMailRequest> requestCaptor = ArgumentCaptor.forClass(SendGridMailRequest.class);
        verify(sendGridService, times(1)).sendTemplatedMail(requestCaptor.capture());
        Map<String, Object> sentDynamicData = requestCaptor.getValue().getRecipients().get(0).getDynamicTemplateData();
        assertThat(sentDynamicData.get("title")).isEqualTo("Developer News");
        assertThat(sentDynamicData.get("today")).isEqualTo("August 3, 2026");
        assertThat(sentDynamicData.get("firstName")).isEqualTo("First");
        assertThat(sentDynamicData.get("lastName")).isEqualTo("Last");
    }

    @Test
    void sendBulkEmailWithLicenseContext_usesAllAsmGroupIdsWhenUnsubscribeListNotConfigured() throws Exception {
        enableSendGrid("http://localhost:65535");
        doReturn(true).when(sendGridService).isConfigured();
        configureNewsTemplate("d-news-template");
        configureBulkType(BulkEmailAudience.CUSTOM, 101L);
        configureBulkType(BulkEmailAudience.ALL_USERS, 102L);
        configureBulkType(BulkEmailAudience.DEVELOPERS, 103L);
        configureBulkType(BulkEmailAudience.SCIENTIFIC_NEWS, 104L);

        SendGridSendResult result = new SendGridSendResult();
        result.setStatusCode(202);
        doReturn(result).when(sendGridService).sendTemplatedMail(any(SendGridMailRequest.class));

        UserDTO recipient = user(4L, "prefs-user", "prefs-user@example.org");

        mailService.sendBulkEmailWithLicenseContext(
            Collections.singletonList(recipient),
            "no-reply@oncokb.org",
            null,
            "admin",
            BulkEmailAudience.CUSTOM,
            null
        );

        ArgumentCaptor<SendGridMailRequest> requestCaptor = ArgumentCaptor.forClass(SendGridMailRequest.class);
        verify(sendGridService, times(1)).sendTemplatedMail(requestCaptor.capture());
        assertThat(requestCaptor.getValue().getAsmGroupId()).isEqualTo(101L);
        assertThat(requestCaptor.getValue().getGroupsToDisplay()).containsExactly(101L, 102L, 103L, 104L);
    }

    private void enableSendGrid(String baseUrl) {
        SendGridProperties sendGridProperties = applicationProperties.getSendgrid();
        sendGridProperties.setEnabled(true);
        sendGridProperties.setApiKey("test-api-key");
        sendGridProperties.setBaseUrl(baseUrl);
    }

    private void configureBulkType(BulkEmailAudience audience, Long asmGroupId) {
        SendGridProperties.BulkEmailTypeConfig config;
        switch (audience) {
            case CUSTOM:
                config = applicationProperties.getSendgrid().getBulkEmailTypes().getCustom();
                break;
            case ALL_USERS:
                config = applicationProperties.getSendgrid().getBulkEmailTypes().getAllUsers();
                break;
            case DEVELOPERS:
                config = applicationProperties.getSendgrid().getBulkEmailTypes().getDevelopers();
                break;
            case SCIENTIFIC_NEWS:
                config = applicationProperties.getSendgrid().getBulkEmailTypes().getScientificNews();
                break;
            default:
                throw new IllegalArgumentException("Unsupported audience: " + audience);
        }

        config.setAsmGroupId(asmGroupId);
    }

    private void configureNewsTemplate(String templateId) {
        applicationProperties.getSendgrid().setNewsTemplate(templateId);
    }

    private void configureNewsTemplateNoUnsubscribe(String templateId) {
        applicationProperties.getSendgrid().setNewsTemplateNoUnsubscribe(templateId);
    }

    private UserDTO user(Long id, String login, String email) {
        UserDTO user = new UserDTO();
        user.setId(id);
        user.setLogin(login);
        user.setEmail(email);
        user.setFirstName("First");
        user.setLastName("Last");
        user.setLangKey("en");
        return user;
    }

}
