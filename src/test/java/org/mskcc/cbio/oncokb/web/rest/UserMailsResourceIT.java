package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.RedisTestContainerExtension;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserMails;
import org.mskcc.cbio.oncokb.repository.UserMailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.UserMailsService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.mapper.UserMailsMapper;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import javax.persistence.EntityManager;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
/**
 * Integration tests for the {@link UserMailsResource} REST controller.
 */
@SpringBootTest(classes = OncokbPublicApp.class)
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser(authorities = AuthoritiesConstants.ADMIN)
public class UserMailsResourceIT {

    private static final Instant DEFAULT_SENT_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_SENT_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_SENT_BY = "AAAAAAAAAA";
    private static final String UPDATED_SENT_BY = "BBBBBBBBBB";

    private static final String DEFAULT_SENT_FROM = "AAAAAAAAAA";
    private static final String UPDATED_SENT_FROM = "BBBBBBBBBB";

    private static final MailType DEFAULT_MAIL_TYPE = MailType.ACTIVATION;
    private static final MailType UPDATED_MAIL_TYPE = MailType.APPROVAL;

    private static final String DEFAULT_USER_LOGIN = "johndoe@localhost";

    @Autowired
    private UserMailsRepository userMailsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMailsMapper userMailsMapper;

    @Autowired
    private UserMailsService userMailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserMailsMockMvc;

    private UserMails userMails;

    private User user;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserMails createEntity(EntityManager em) {
        UserMails userMails = new UserMails()
            .sentDate(DEFAULT_SENT_DATE)
            .sentBy(DEFAULT_SENT_BY)
            .sentFrom(DEFAULT_SENT_FROM)
            .mailType(DEFAULT_MAIL_TYPE);
        return userMails;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserMails createUpdatedEntity(EntityManager em) {
        UserMails userMails = new UserMails()
            .sentDate(UPDATED_SENT_DATE)
            .sentBy(UPDATED_SENT_BY)
            .sentFrom(UPDATED_SENT_FROM)
            .mailType(UPDATED_MAIL_TYPE);
        return userMails;
    }

    public static User createUserEntity(EntityManager em) {
        User user = new User();
        user.setLogin(DEFAULT_USER_LOGIN);
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        user.setEmail(DEFAULT_USER_LOGIN);
        user.setFirstName("john");
        user.setLastName("doe");
        user.setImageUrl("http://placehold.it/50x50");
        user.setLangKey("en");
        return user;
    }

    @BeforeEach
    public void initTest() {
        userMails = createEntity(em);
        user = createUserEntity(em);
    }

    @Test
    @Transactional
    public void getAllUserMails() throws Exception {
        // Initialize the database
        userMailsRepository.saveAndFlush(userMails);

        // Get all the userMailsList
        restUserMailsMockMvc.perform(get("/api/user-mails"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userMails.getId().intValue())))
            .andExpect(jsonPath("$.[*].sentDate").value(hasItem(DEFAULT_SENT_DATE.toString())))
            .andExpect(jsonPath("$.[*].sentBy").value(hasItem(DEFAULT_SENT_BY)))
            .andExpect(jsonPath("$.[*].sentFrom").value(hasItem(DEFAULT_SENT_FROM)))
            .andExpect(jsonPath("$.[*].mailType").value(hasItem(DEFAULT_MAIL_TYPE.toString())));
    }

    @Test
    @Transactional
    public void getUserMails() throws Exception {
        // Initialize the database
        userRepository.saveAndFlush(user);
        userMails.setUser(user);
        userMailsRepository.saveAndFlush(userMails);

        // Get the userMails
        restUserMailsMockMvc.perform(get("/api/user-mails/users/{login}", user.getLogin()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(userMails.getId().intValue()))
            .andExpect(jsonPath("$.[*].sentDate").value(DEFAULT_SENT_DATE.toString()))
            .andExpect(jsonPath("$.[*].sentBy").value(DEFAULT_SENT_BY))
            .andExpect(jsonPath("$.[*].sentFrom").value(DEFAULT_SENT_FROM))
            .andExpect(jsonPath("$.[*].mailType").value(DEFAULT_MAIL_TYPE.toString()))
            .andExpect(jsonPath("$.[*].userLogin").value(DEFAULT_USER_LOGIN));
    }
    @Test
    @Transactional
    public void getNonExistingUserMails() throws Exception {
        // Get the userMails
        restUserMailsMockMvc.perform(get("/api/user-mails/users/{login}", "non-existing-login@localhost"))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void deleteUserMails() throws Exception {
        // Initialize the database
        userMailsRepository.saveAndFlush(userMails);

        int databaseSizeBeforeDelete = userMailsRepository.findAll().size();

        // Delete the userMails
        restUserMailsMockMvc.perform(delete("/api/user-mails/{id}", userMails.getId())
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<UserMails> userMailsList = userMailsRepository.findAll();
        assertThat(userMailsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
