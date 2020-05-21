package org.mskcc.cbio.oncokb.web.rest;


import io.github.jhipster.security.RandomUtil;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.*;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing crobjobs.
 */
@RestController
@RequestMapping("/api/cronjob")
@PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.BOT + "\")")
public class CronJobController {

    private final Logger log = LoggerFactory.getLogger(CronJobController.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final TokenService tokenService;

    @Autowired
    private UserMapper userMapper;

    private final MailService mailService;

    private final TokenProvider tokenProvider;

    public CronJobController(UserRepository userRepository, UserService userService,
                             MailService mailService, TokenProvider tokenProvider,
                             TokenService tokenService
                           ) {

        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.tokenProvider = tokenProvider;
        this.tokenService = tokenService;
    }

    /**
     * {@code GET  /renew-tokens} : Checking token expiration.
     *
     */
    @GetMapping(path = "/renew-tokens")
    public void tokensRenewCheck() {
        log.info("Started the cronjob to renew tokens");

        int EXPIRATION_CHECK = 60 * 60 * 24 * 14; // two weeks
        List<Token> tokensToBeExpired = tokenService.findAllExpiresBeforeDate(Instant.now().plusSeconds(EXPIRATION_CHECK));
        // Only return the users that token is about to expire and activation key is empty/null
        // Once the activation key is not null, means the email has been sent.
        List<User> selectedUsers = tokensToBeExpired.stream()
            .map(token -> token.getUser())
            .distinct()
            .filter(user -> StringUtils.isEmpty(user.getActivationKey()) && user.getActivated() && !this.userService.userHasAuthority(user, AuthoritiesConstants.PUBLIC_WEBSITE))
            .collect(Collectors.toList());

        selectedUsers.forEach(user -> {
            if (canBeAutoRenew(user)) {
                // For certain users, we should automatically renew the account
                tokensToBeExpired.stream().filter(token -> token.getUser().equals(user)).forEach(token -> renewToken(token));
            } else {
                // Generate an activation key
                user.setActivationKey(RandomUtil.generateActivationKey());
                userRepository.save(user);

                // Send email to ask user to verify the account ownership
                mailService.sendEmailDeclareEmailOwnership(userMapper.userToUserDTO(user), MailType.DECLARE_EMAIL_OWNERSHIP, 14);
            }
        });
    }

    private boolean canBeAutoRenew(User user) {
        return userService.userHasAuthority(user, AuthoritiesConstants.ADMIN) ||
            userService.userHasAuthority(user, AuthoritiesConstants.BOT);
    }

    private void renewToken(Token token) {
        token.setExpiration(token.getExpiration().plusSeconds(tokenProvider.EXPIRATION_TIME_IN_SECONDS));
        tokenService.save(token);
    }
}
