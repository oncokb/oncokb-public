package org.mskcc.cbio.oncokb.repository;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.mskcc.cbio.oncokb.config.cache.UserCacheResolver;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.web.rest.UserResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for the {@link UserRepository}.
 */
@AutoConfigureMockMvc
@WithMockUser(authorities = AuthoritiesConstants.ADMIN)
@SpringBootTest(classes = OncokbPublicApp.class)
public class UserRepositoryIT {

    private static final String DEFAULT_LOGIN = "johndoe";

    private static final String DEFAULT_EMAIL = "johndoe@localhost";

    private static final String DEFAULT_FIRSTNAME = "john";

    private static final String DEFAULT_LASTNAME = "doe";

    private static final String DEFAULT_IMAGEURL = "http://placehold.it/50x50";

    private static final String DEFAULT_LANGKEY = "en";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private CacheNameResolver cacheNameResolver;

    private User user;

    @BeforeEach
    public void setup() {
        cacheManager.getCache(this.cacheNameResolver.getCacheName(UserCacheResolver.USERS_BY_LOGIN_CACHE)).clear();
        cacheManager.getCache(this.cacheNameResolver.getCacheName(UserCacheResolver.USERS_BY_EMAIL_CACHE)).clear();
    }

    /**
     * Create a User.
     * <p>
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which has a required relationship to the User entity.
     */
    public static User createEntity(EntityManager em) {
        User user = new User();
        user.setLogin(DEFAULT_LOGIN + RandomStringUtils.randomAlphabetic(5));
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        user.setEmail(RandomStringUtils.randomAlphabetic(5) + DEFAULT_EMAIL);
        user.setFirstName(DEFAULT_FIRSTNAME);
        user.setLastName(DEFAULT_LASTNAME);
        user.setImageUrl(DEFAULT_IMAGEURL);
        user.setLangKey(DEFAULT_LANGKEY);
        return user;
    }

    @BeforeEach
    public void initTest() {
        user = createEntity(em);
        user.setLogin(DEFAULT_LOGIN);
        user.setEmail(DEFAULT_EMAIL);
    }

    @Test
    @Transactional
    public void findOneWithAuthoritiesByLogin() throws Exception {
        // Initialize the database
        userRepository.saveAndFlush(user);

        Optional<User> persistenceUser = userRepository.findOneWithAuthoritiesByLogin(user.getLogin());
        // Can find the record in the database
        assertThat(persistenceUser.isPresent()).isTrue();
    }

    @Test
    @Transactional
    public void findOneWithAuthoritiesByEmailIgnoreCase() throws Exception {
        // Initialize the database
        userRepository.saveAndFlush(user);

        Optional<User> persistenceUser = userRepository.findOneWithAuthoritiesByEmailIgnoreCase(user.getEmail());
        // Can find the record in the database
        assertThat(persistenceUser.isPresent()).isTrue();
    }
}
