package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.TrialAccount;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;

import io.github.jhipster.security.RandomUtil;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.auditing.AuditingHandler;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.when;

/**
 * Integration tests for {@link UserService}.
 */
@SpringBootTest(classes = OncokbPublicApp.class)
@Transactional
public class UserServiceIT {

    private static final String DEFAULT_LOGIN = "johndoe";

    private static final String DEFAULT_EMAIL = "johndoe@localhost";

    private static final String DEFAULT_FIRSTNAME = "john";

    private static final String DEFAULT_LASTNAME = "doe";

    private static final String DEFAULT_IMAGEURL = "http://placehold.it/50x50";

    private static final String DEFAULT_LANGKEY = "dummy";

    private static final Integer DEFAULT_TRIAL_PERIOD_IN_DAYS = 90;

    private static final Long timeDiffToleranceInMilliseconds = 1000L;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AuditingHandler auditingHandler;

    @Mock
    private DateTimeProvider dateTimeProvider;

    private User user;

    @BeforeEach
    public void init() {
        user = new User();
        user.setLogin(DEFAULT_LOGIN);
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        user.setEmail(DEFAULT_EMAIL);
        user.setFirstName(DEFAULT_FIRSTNAME);
        user.setLastName(DEFAULT_LASTNAME);
        user.setImageUrl(DEFAULT_IMAGEURL);
        user.setLangKey(DEFAULT_LANGKEY);

        when(dateTimeProvider.getNow()).thenReturn(Optional.of(LocalDateTime.now()));
        auditingHandler.setDateTimeProvider(dateTimeProvider);
    }

    @Test
    @Transactional
    public void assertThatUserMustExistToResetPassword() {
        userRepository.saveAndFlush(user);
        Optional<User> maybeUser = userService.requestPasswordReset("invalid.login@localhost");
        assertThat(maybeUser).isNotPresent();

        maybeUser = userService.requestPasswordReset(user.getLogin());
        assertThat(maybeUser).isPresent();
        assertThat(maybeUser.orElse(null).getLogin()).isEqualTo(user.getLogin());
        assertThat(maybeUser.orElse(null).getResetDate()).isNotNull();
        assertThat(maybeUser.orElse(null).getResetKey()).isNotNull();
    }

    @Test
    @Transactional
    public void assertThatInactivateUserCanRequestPasswordReset() {
        user.setActivated(false);
        userRepository.saveAndFlush(user);

        Optional<User> maybeUser = userService.requestPasswordReset(user.getLogin());
        assertThat(maybeUser).isPresent();
        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatResetKeyMustBeValid() {
        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey("1234");
        userRepository.saveAndFlush(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", "4321");
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatUserCanResetPassword() {
        String oldPassword = user.getPassword();
        Instant daysAgo = Instant.now().minus(2, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);
        userRepository.saveAndFlush(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser).isPresent();
        assertThat(maybeUser.orElse(null).getResetDate()).isNull();
        assertThat(maybeUser.orElse(null).getResetKey()).isNull();
        assertThat(maybeUser.orElse(null).getPassword()).isNotEqualTo(oldPassword);

        userRepository.delete(user);
    }

    @Test
    @Transactional
    public void assertThatAnonymousUserIsNotGet() {
        user.setLogin(Constants.ANONYMOUS_USER);
        if (!userRepository.findOneByLogin(Constants.ANONYMOUS_USER).isPresent()) {
            userRepository.saveAndFlush(user);
        }
        final PageRequest pageable = PageRequest.of(0, (int) userRepository.count());
        final Page<UserDTO> allManagedUsers = userService.getAllManagedUsers(pageable);
        assertThat(allManagedUsers.getContent().stream()
            .noneMatch(user -> Constants.ANONYMOUS_USER.equals(user.getLogin())))
            .isTrue();
    }

    @Test
    @Transactional
    public void assertThatUserTokensUpdateAfterTrialApproval() {
        User savedUser = userRepository.saveAndFlush(user);

        Optional<UserDTO> approvedUser = userService.approveUser(userMapper.userToUserDTO(savedUser), true);

        assertThat(approvedUser).isPresent();
        assertThat(approvedUser.get().isActivated()).isTrue();
        List<Token> tokens = tokenService.findByUser(savedUser);
        assertThat(tokens.stream()
            .allMatch(token -> token.isRenewable().equals(false)))
            .isTrue();
    }

    @Test
    public void assertThatUserHasUnactivatedTrial() {
        User savedUser = userRepository.saveAndFlush(user);
        UserDTO userDTO = userMapper.userToUserDTO(savedUser);

        // Null check
        assertThat(userService.userHasUnactivatedTrial(null)).isFalse();

        // Prpoerty null check
        AdditionalInfoDTO additionalInfo = null;
        userDTO.setAdditionalInfo(additionalInfo);
        assertThat(userService.userHasUnactivatedTrial(userDTO)).isFalse();

        // Another property null check
        additionalInfo = new AdditionalInfoDTO();
        additionalInfo.setTrialAccount(new TrialAccount());
        userDTO.setAdditionalInfo(additionalInfo);
        assertThat(userService.userHasUnactivatedTrial(userDTO)).isFalse();

        // Check trial account initiated, but not activated
        Optional<User> unactivatedUser = userService.initiateTrialAccountActivation(userDTO.getLogin());
        UserDTO unactivatedUserDTO = userMapper.userToUserDTO(unactivatedUser.get());
        Boolean unactivatedUserResult = userService.userHasUnactivatedTrial(unactivatedUserDTO);
        assertThat(unactivatedUserResult).isTrue();

        // Check trial account activated
        Optional<UserDTO> activatedUserDTO = userService.finishTrialAccountActivation(unactivatedUserDTO.getAdditionalInfo().getTrialAccount().getActivation().getKey());
        Boolean activatedUserResult = userService.userHasUnactivatedTrial(activatedUserDTO.get());
        assertThat(activatedUserResult).isFalse();
    }

    @Test
    public void assertThatUserWithAtleastOneRenewableTokenIsRegular() {
        User savedUser = userRepository.saveAndFlush(user);

        Token renewableToken = new Token();
        renewableToken.setToken(UUID.randomUUID());
        renewableToken.setUser(savedUser);
        renewableToken.setRenewable(true);

        Token nonRenewableToken = new Token();
        nonRenewableToken.setToken(UUID.randomUUID());
        nonRenewableToken.setUser(savedUser);
        nonRenewableToken.setRenewable(false);

        // User with one renewable token should be regular user.
        tokenService.save(renewableToken);
        Optional<User> optionalUser = userRepository.findOneById(savedUser.getId());
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        assertThat(userService.isUserOnTrial(userDTO)).isFalse();

        // User with atleast one renewable token should be regular user.
        tokenService.save(nonRenewableToken);
        Optional<User> optionalUser2 = userRepository.findOneById(savedUser.getId());
        UserDTO userDTO2 = userMapper.userToUserDTO(optionalUser2.get());
        assertThat(userService.isUserOnTrial(userDTO2)).isFalse();
    }

    @Test
    public void assertThatUserWithOnlyNonRenewableTokensIsOnTrial() {
        User savedUser = userRepository.saveAndFlush(user);

        Token nonRenewableToken = new Token();
        nonRenewableToken.setToken(UUID.randomUUID());
        nonRenewableToken.setUser(savedUser);
        nonRenewableToken.setRenewable(false);

        Token nonRenewableToken2 = new Token();
        nonRenewableToken2.setToken(UUID.randomUUID());
        nonRenewableToken2.setUser(savedUser);
        nonRenewableToken2.setRenewable(false);

        // User with one non renewable token is on trial.
        tokenService.save(nonRenewableToken);
        Optional<User> optionalUser = userRepository.findOneById(savedUser.getId());
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        assertThat(userService.isUserOnTrial(userDTO)).isTrue();

        // User with one or more renewable token is on trial.
        tokenService.save(nonRenewableToken2);
        Optional<User> optionalUser2 = userRepository.findOneById(savedUser.getId());
        UserDTO userDTO2 = userMapper.userToUserDTO(optionalUser2.get());
        assertThat(userService.isUserOnTrial(userDTO2)).isTrue();
    }

    @Test
    public void assertThatApprovedTrialUserTokenLengthRenewedWhenApproved() {
        User savedUser = userRepository.saveAndFlush(user);

        Token nonRenewableToken = new Token();
        nonRenewableToken.setToken(UUID.randomUUID());
        nonRenewableToken.setUser(savedUser);
        nonRenewableToken.setExpiration(Instant.now().plus(DEFAULT_TRIAL_PERIOD_IN_DAYS - 30, ChronoUnit.DAYS));
        nonRenewableToken.setRenewable(false);

        tokenService.save(nonRenewableToken);
        Optional<User> optionalUser = userRepository.findOneById(savedUser.getId());
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        userService.approveUser(userDTO, true);

        // If a user is approved and they have a trial token that is less than 90 days in length, then
        // the token should be updated to expire in 90 days. 
        List<Token> tokens = tokenService.findByUser(optionalUser.get());
        assertThat(tokens).extracting(Token::isRenewable).allMatch(renewable -> renewable.equals(false));
        assertThat(tokens.get(0).getExpiration())
            .isCloseTo(Instant.now().plus(DEFAULT_TRIAL_PERIOD_IN_DAYS, ChronoUnit.DAYS), within(timeDiffToleranceInMilliseconds, ChronoUnit.MILLIS));
    }

    @Test
    public void assertThatApprovedTrialUserTokenLengthPreservedIfLongerThanDefaultTrialPeriod() {
        User savedUser = userRepository.saveAndFlush(user);
        Instant longerUserTokenLength = Instant.now().plus(DEFAULT_TRIAL_PERIOD_IN_DAYS + 30, ChronoUnit.DAYS);

        Token nonRenewableToken = new Token();
        nonRenewableToken.setToken(UUID.randomUUID());
        nonRenewableToken.setUser(savedUser);
        nonRenewableToken.setExpiration(longerUserTokenLength);
        nonRenewableToken.setRenewable(false);

        tokenService.save(nonRenewableToken);
        Optional<User> optionalUser = userRepository.findOneById(savedUser.getId());
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        userService.approveUser(userDTO, true);

        // We have some users with longer trial periods, so their trial length should be preserved,
        // when they are approved (ie. when adding them to a company)
        List<Token> tokens = tokenService.findByUser(optionalUser.get());
        assertThat(tokens).extracting(Token::isRenewable).allMatch(renewable -> renewable.equals(false));
        assertThat(tokens.get(0).getExpiration())
            .isCloseTo(longerUserTokenLength, within(timeDiffToleranceInMilliseconds, ChronoUnit.MILLIS));
    }

}
