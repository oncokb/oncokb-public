package org.mskcc.cbio.oncokb.security;

import org.mskcc.cbio.oncokb.RedisTestContainerExtension;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.UserRepository;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

/**
 * Integrations tests for {@link DomainUserDetailsService}.
 */
@SpringBootTest(classes = OncokbPublicApp.class)
@Transactional
public class DomainUserDetailsServiceIT {

    private static final String USER_ONE_LOGIN = "test-user-one";
    private static final String USER_ONE_EMAIL = "test-user-one@localhost";
    private static final String USER_TWO_LOGIN = "test-user-two";
    private static final String USER_TWO_EMAIL = "test-user-two@localhost";
    private static final String USER_THREE_LOGIN = "test-user-three";
    private static final String USER_THREE_EMAIL = "test-user-three@localhost";
    private static final String USER_FOUR_LOGIN = "test-user-four";
    private static final String USER_FOUR_EMAIL = "test-user-four@localhost";
    private static final String USER_FIVE_LOGIN = "test-user-five";
    private static final String USER_FIVE_EMAIL = "test-user-five@localhost";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsService domainUserDetailsService;

    @BeforeEach
    public void init() {
        User userOne = new User();
        userOne.setLogin(USER_ONE_LOGIN);
        userOne.setPassword(RandomStringUtils.random(60));
        userOne.setActivated(true);
        userOne.setEmail(USER_ONE_EMAIL);
        userOne.setFirstName("userOne");
        userOne.setLastName("doe");
        userOne.setLangKey("en");
        userRepository.save(userOne);

        User userTwo = new User();
        userTwo.setLogin(USER_TWO_LOGIN);
        userTwo.setPassword(RandomStringUtils.random(60));
        userTwo.setActivated(true);
        userTwo.setEmail(USER_TWO_EMAIL);
        userTwo.setFirstName("userTwo");
        userTwo.setLastName("doe");
        userTwo.setLangKey("en");
        userRepository.save(userTwo);

        User userThree = new User();
        userThree.setLogin(USER_THREE_LOGIN);
        userThree.setPassword(RandomStringUtils.random(60));
        userThree.setActivated(false);
        userThree.setEmail(USER_THREE_EMAIL);
        userThree.setFirstName("userThree");
        userThree.setLastName("doe");
        userThree.setLangKey("en");
        userRepository.save(userThree);

        // The save method sets the created date on the first creation of the user.
        // In order to get around this we do an update to the same user to force
        // an older creation date.
        userThree.setCreatedDate(Instant.now().minus(Duration.ofDays(15)));
        userRepository.save(userThree);

        User userFour = new User();
        userFour.setLogin(USER_FOUR_LOGIN);
        userFour.setPassword(RandomStringUtils.random(60));
        userFour.setActivated(false);
        userFour.setEmail(USER_FOUR_EMAIL);
        userFour.setFirstName("userFour");
        userFour.setLastName("doe");
        userFour.setLangKey("en");
        userRepository.save(userFour);

        userFour.setCreatedDate(Instant.now().minus(Duration.ofDays(5)));
        userRepository.save(userFour);

        User userFive = new User();
        userFive.setLogin(USER_FIVE_LOGIN);
        userFive.setPassword(RandomStringUtils.random(60));
        userFive.setActivated(false);
        userFive.setEmail(USER_FIVE_EMAIL);
        userFive.setFirstName("userFive");
        userFive.setLastName("doe");
        userFive.setLangKey("en");
        userFive.setActivationKey(RandomStringUtils.random(20));
        userRepository.save(userFive);

        userFive.setCreatedDate(Instant.now().minus(Duration.ofDays(7)));
        userRepository.save(userFive);
    }

    @Test
    public void assertThatUserCanBeFoundByLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_LOGIN);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    public void assertThatUserCanBeFoundByLoginIgnoreCase() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_LOGIN.toUpperCase(Locale.ENGLISH));
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    public void assertThatUserCanBeFoundByEmail() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_TWO_EMAIL);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_TWO_LOGIN);
    }

    @Test
    public void assertThatUserCanBeFoundByEmailIgnoreCase() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_TWO_EMAIL.toUpperCase(Locale.ENGLISH));
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_TWO_LOGIN);
    }

    @Test
    public void assertThatEmailIsPrioritizedOverLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_ONE_EMAIL);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_ONE_LOGIN);
    }

    @Test
    public void assertThatUserNotActivatedExceptionIsThrownForPostGracePeriodUsers() {
        assertThatExceptionOfType(UserNotApprovedException.class).isThrownBy(
            () -> domainUserDetailsService.loadUserByUsername(USER_THREE_LOGIN));
    }

    @Test
    public void assertThatGracePeriodUserCanLogin() {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(USER_FOUR_EMAIL);
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(USER_FOUR_LOGIN);
    }

    @Test
    public void assertThatUserWithActivationKeyPastGracePeriodThrowsUserNotActivated() {
        assertThatExceptionOfType(UserNotActivatedException.class)
            .isThrownBy(() -> domainUserDetailsService.loadUserByUsername(USER_FIVE_LOGIN));
    }

    @Test
    public void assertThatUnknownEmailThrowsUsernameNotFound() {
        assertThatExceptionOfType(UsernameNotFoundException.class)
            .isThrownBy(() -> domainUserDetailsService.loadUserByUsername("missing@oncokb.org"));
    }

    @Test
    public void assertThatUnknownLoginThrowsUsernameNotFound() {
        assertThatExceptionOfType(UsernameNotFoundException.class)
            .isThrownBy(() -> domainUserDetailsService.loadUserByUsername("unknown-login"));
    }
}
