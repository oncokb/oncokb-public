package org.mskcc.cbio.oncokb.web.rest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.BulkEmailAudience;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.UserMailsService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.ExceptionTranslator;
import org.mskcc.cbio.oncokb.web.rest.vm.BulkUserMailRequestVM;
import org.springframework.http.MediaType;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MailsControllerTest {

    @Mock
    private MailService mailService;

    @Mock
    private UserService userService;

    @Mock
    private UserMailsService userMailsService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private CompanyService companyService;

    private MockMvc restMockMvc;

    @BeforeEach
    void setup() {
        MailsController mailsController = new MailsController(
            mailService,
            userService,
            userMailsService,
            userMapper,
            companyService,
            new ApplicationProperties()
        );

        this.restMockMvc = MockMvcBuilders
            .standaloneSetup(mailsController)
            .setControllerAdvice(new ExceptionTranslator(new MockEnvironment()))
            .build();
    }

    @Test
    void sendBulkUserMails_shouldReturnBadRequest_whenCustomRecipientsMissing() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.CUSTOM);
        request.setRecipients(null);

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("No recipients were provided."));

        verify(mailService, never()).sendBulkEmailWithLicenseContext(anyList(), eq("no-reply@oncokb.org"), eq("cc@oncokb.org"), eq("admin"), eq(BulkEmailAudience.CUSTOM), eq(null));
    }

    @Test
    void sendBulkUserMails_shouldReturnBadRequest_whenCustomRecipientsEmpty() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.CUSTOM);
        request.setRecipients(Collections.emptyList());

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("No recipients were provided."));
    }

    @Test
    void sendBulkUserMails_shouldReturnOk_whenAllCustomRecipientsAreMissing() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.CUSTOM);
        request.setRecipients(Arrays.asList("missing1@oncokb.org", "missing2@oncokb.org"));

        when(userService.getSendRecipientsByLoginsOrEmails(anyList())).thenReturn(Collections.emptyMap());

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("null Could not find users for: missing1@oncokb.org, missing2@oncokb.org"));

        verify(userService).getSendRecipientsByLoginsOrEmails(anyList());
        verify(mailService).sendBulkEmailWithLicenseContext(anyList(), eq("no-reply@oncokb.org"), eq("cc@oncokb.org"), eq("admin"), eq(BulkEmailAudience.CUSTOM), eq(null));
    }

    @Test
    void sendBulkUserMails_shouldReturnBadRequest_whenAudienceHasNoUsers() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.ALL_USERS);
        request.setRecipients(null);

        when(userService.getBulkEmailAudienceUsers(BulkEmailAudience.ALL_USERS)).thenReturn(Collections.emptyList());

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("No valid recipients were found."));
    }

    @Test
    void sendBulkUserMails_shouldReturnBadRequest_whenRecipientsProvidedForNonCustomAudience() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.DEVELOPERS);
        request.setRecipients(Collections.singletonList("should-not-be-here@oncokb.org"));

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Recipients should not be provided for non-CUSTOM audiences."));

        verify(userService, never()).getBulkEmailAudienceUsers(BulkEmailAudience.DEVELOPERS);
        verify(mailService, never()).sendBulkEmailWithLicenseContext(anyList(), eq("no-reply@oncokb.org"), eq("cc@oncokb.org"), eq("admin"), eq(BulkEmailAudience.DEVELOPERS), eq(null));
    }

    @Test
    void sendBulkUserMails_shouldHandleCustomAudience_withMissingAndFoundRecipients() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.CUSTOM);
        request.setRecipients(Arrays.asList("known@oncokb.org", "missing@oncokb.org"));

        UserDTO knownUser = userWithId(1L, "known", "known@oncokb.org");
        Map<String, UserDTO> recipientMap = new LinkedHashMap<>();
        recipientMap.put("known@oncokb.org", knownUser);

        when(userService.getSendRecipientsByLoginsOrEmails(request.getRecipients())).thenReturn(recipientMap);
        when(mailService.sendBulkEmailWithLicenseContext(
            eq(Collections.singletonList(knownUser)),
            eq("no-reply@oncokb.org"),
            eq("cc@oncokb.org"),
            eq("admin"),
            eq(BulkEmailAudience.CUSTOM),
            eq(null)
        )).thenReturn("Queued 1 emails.");

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("Queued 1 emails. Could not find users for: missing@oncokb.org"));
    }

    @Test
    void sendBulkUserMails_shouldHandleAllUsersAudience() throws Exception {
        shouldHandleNonCustomAudience(BulkEmailAudience.ALL_USERS);
    }

    @Test
    void sendBulkUserMails_shouldHandleDevelopersAudience() throws Exception {
        shouldHandleNonCustomAudience(BulkEmailAudience.DEVELOPERS);
    }

    @Test
    void sendBulkUserMails_shouldHandleScientificNewsAudience() throws Exception {
        shouldHandleNonCustomAudience(BulkEmailAudience.SCIENTIFIC_NEWS);
    }

    private void shouldHandleNonCustomAudience(BulkEmailAudience audience) throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(audience);
        request.setRecipients(new ArrayList<>());

        List<UserDTO> users = Collections.singletonList(userWithId(11L, "user11", "user11@oncokb.org"));
        when(userService.getBulkEmailAudienceUsers(audience)).thenReturn(users);
        when(mailService.sendBulkEmailWithLicenseContext(
            eq(users),
            eq("no-reply@oncokb.org"),
            eq("cc@oncokb.org"),
            eq("admin"),
            eq(audience),
            eq(null)
        )).thenReturn("Queued 1 emails for " + audience.name());

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("Queued 1 emails for " + audience.name()));

        verify(userService).getBulkEmailAudienceUsers(audience);

        ArgumentCaptor<List<UserDTO>> usersCaptor = ArgumentCaptor.forClass(List.class);
        verify(mailService).sendBulkEmailWithLicenseContext(
            usersCaptor.capture(),
            eq("no-reply@oncokb.org"),
            eq("cc@oncokb.org"),
            eq("admin"),
            eq(audience),
            eq(null)
        );
        assertThat(usersCaptor.getValue()).hasSize(1);
    }

    @Test
    void sendBulkUserMails_shouldPassDynamicContent() throws Exception {
        BulkUserMailRequestVM request = baseBulkRequest(BulkEmailAudience.CUSTOM);
        request.setRecipients(Collections.singletonList("known@oncokb.org"));
        Map<String, Object> dynamicContent = new HashMap<>();
        dynamicContent.put("title", "Developer News");
        request.setDynamicContent(dynamicContent);

        UserDTO knownUser = userWithId(1L, "known", "known@oncokb.org");
        Map<String, UserDTO> recipientMap = new LinkedHashMap<>();
        recipientMap.put("known@oncokb.org", knownUser);

        when(userService.getSendRecipientsByLoginsOrEmails(request.getRecipients())).thenReturn(recipientMap);
        when(mailService.sendBulkEmailWithLicenseContext(
            eq(Collections.singletonList(knownUser)),
            eq("no-reply@oncokb.org"),
            eq("cc@oncokb.org"),
            eq("admin"),
            eq(BulkEmailAudience.CUSTOM),
            eq(dynamicContent)
        )).thenReturn("Queued 1 emails.");

        restMockMvc
            .perform(post("/api/mails/users/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("Queued 1 emails."));
    }

    private BulkUserMailRequestVM baseBulkRequest(BulkEmailAudience audience) {
        BulkUserMailRequestVM request = new BulkUserMailRequestVM();
        request.setFrom("no-reply@oncokb.org");
        request.setCc("cc@oncokb.org");
        request.setBy("admin");
        request.setAudience(audience);
        return request;
    }

    private UserDTO userWithId(Long id, String login, String email) {
        UserDTO user = new UserDTO();
        user.setId(id);
        user.setLogin(login);
        user.setEmail(email);
        return user;
    }
}
