package org.mskcc.cbio.oncokb.web.rest;


import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.mskcc.cbio.oncokb.service.*;
import org.mskcc.cbio.oncokb.service.dto.PasswordChangeDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.*;
import org.mskcc.cbio.oncokb.web.rest.errors.EmailAlreadyUsedException;
import org.mskcc.cbio.oncokb.web.rest.errors.InvalidPasswordException;
import org.mskcc.cbio.oncokb.web.rest.vm.KeyAndPasswordVM;
import org.mskcc.cbio.oncokb.web.rest.vm.ManagedUserVM;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.naming.AuthenticationException;
import javax.servlet.http.HttpServletRequest;
import javax.swing.text.html.Option;
import javax.validation.Valid;
import java.util.*;

import static org.mskcc.cbio.oncokb.config.Constants.MSK_EMAIL_DOMAIN;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {
        private AccountResourceException(String message) {
            super(message);
        }
    }

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final SlackService slackService;

    private final EmailService emailService;

    private final TokenService tokenService;

    private final ApplicationProperties applicationProperties;

    @Autowired
    private UserMapper userMapper;

    private final MailService mailService;

    private final TokenProvider tokenProvider;

    public AccountResource(UserRepository userRepository, UserService userService,
                           MailService mailService, TokenProvider tokenProvider,
                           SlackService slackService, EmailService emailService,
                           TokenService tokenService, ApplicationProperties applicationProperties
                           ) {

        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.tokenProvider = tokenProvider;
        this.slackService = slackService;
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.applicationProperties = applicationProperties;
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException  {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        if (!checkPasswordLength(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userService.registerUser(managedUserVM, managedUserVM.getPassword());
        mailService.sendActivationEmail(userMapper.userToUserDTO(user));
    }

    /**
     * {@code GET  /activate} : activate the registered user.
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public boolean activateAccount(@RequestParam(value = "key") String key) {
        Optional<User> userOptional = userService.getUserByActivationKey(key);
        if (!userOptional.isPresent()) {
            throw new AccountResourceException("Your user account could not be activated as no user was found associated with this activation key.");
        } else {
            boolean newUserActivation = !userOptional.get().getActivated();
            userOptional = userService.activateRegistration(key);
            User user = userOptional.get();
            if (newUserActivation) {
                if (emailService.getAccountApprovalWhitelistEmailsDomains().contains(emailService.getEmailDomain(user.getEmail()))) {
                    Optional<User> existingUser = userRepository.findOneByLogin(user.getLogin());
                    if (existingUser.isPresent()) {
                        UserDTO userDTO = userMapper.userToUserDTO(existingUser.get());
                        if (userDTO.getLicenseType().equals(LicenseType.ACADEMIC)) {
                            userService.approveUser(userDTO);
                            slackService.sendApprovedConfirmation(userMapper.userToUserDTO(userOptional.get()));
                            return true;
                        } else {
                            slackService.sendUserRegistrationToChannel(userMapper.userToUserDTO(userOptional.get()));
                            return false;
                        }
                    } else {
                        throw new AccountResourceException("User could not be found");
                    }
                } else {
                    UserDTO userDTO = userMapper.userToUserDTO(user);
                    if (isMSKCommercialUser(userDTO)) {
                        LicenseType registeredLicenseType = userDTO.getLicenseType();
                        userDTO.setLicenseType(LicenseType.ACADEMIC);
                        userService.approveUser(userDTO);
                        slackService.sendApprovedConfirmationForMSKCommercialRequest(userMapper.userToUserDTO(userOptional.get()), registeredLicenseType);
                    } else {
                        slackService.sendUserRegistrationToChannel(userMapper.userToUserDTO(userOptional.get()));
                    }
                    return false;
                }
            } else {
                // This user exists before, we are looking for to extend the expiration date of all tokens associated
                tokenService.findByUser(user).forEach(token -> {
                    token.setExpiration(token.getExpiration().plusSeconds(tokenProvider.EXPIRATION_TIME_IN_SECONDS));
                    tokenService.save(token);
                });
            }
            return true;
        }
    }

    private boolean isMSKCommercialUser(UserDTO userDTO) {
        return emailService.getEmailDomain(userDTO.getEmail()).toLowerCase().endsWith(MSK_EMAIL_DOMAIN.toLowerCase()) && !userDTO.getLicenseType().equals(LicenseType.ACADEMIC);
    }

    /**
     * {@code GET  /authenticate} : check if the user is authenticated, and return its login.
     *
     * @param request the HTTP request.
     * @return the login if the user is authenticated.
     */
    @GetMapping("/authenticate")
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public UserDTO getAccount() {
        return userService.getUserWithAuthorities()
            .map(user -> userMapper.userToUserDTO(user))
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws RuntimeException          {@code 500 (Internal Server Error)} if the user login wasn't found.
     */
    @PostMapping("/account")
    public void saveAccount(@Valid @RequestBody UserDTO userDTO) {
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new AccountResourceException("Current user login not found"));
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getLogin().equalsIgnoreCase(userLogin))) {
            throw new EmailAlreadyUsedException();
        }
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        if (!user.isPresent()) {
            throw new AccountResourceException("User could not be found");
        }
        userService.updateUser(
            userDTO.getFirstName(),
            userDTO.getLastName(),
            userDTO.getEmail(),
            userDTO.getLicenseType(),
            userDTO.getJobTitle(),
            userDTO.getCompany(),
            userDTO.getCity(),
            userDTO.getCountry(),
            userDTO.getLangKey(),
            userDTO.getImageUrl()
        );
    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public void changePassword(@RequestBody PasswordChangeDTO passwordChangeDto) {
        if (!checkPasswordLength(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
    }

    /**
     * {@code GET  /account/tokens} : get the list of current logged in user's tokens.
     *
     * @return list of tokens
     */
    @GetMapping(path = "/account/tokens")
    public List<Token> getTokens() {
        Optional<String> userLogin = SecurityUtils.getCurrentUserLogin();
        if (userLogin.isPresent()) {
            Optional<User> user = userService.getUserWithAuthoritiesByLogin(userLogin.get());
            if (user.isPresent()) {
                return tokenProvider.getUserTokens(user.get());
            } else {
                throw new AccountResourceException("Cannot find the user");
            }
        } else {
            throw new AccountResourceException("User is not logged in");
        }
    }

    /**
     * {@code POST  /account/tokens} : create a new token for the current user's token.
     *
     * @return the new token
     */
    @PostMapping(path = "/account/tokens")
    public Token createToken() {
        Optional<String> userLogin = SecurityUtils.getCurrentUserLogin();
        if (userLogin.isPresent()) {
            Optional<User> user = userService.getUserWithAuthoritiesByLogin(userLogin.get());
            List<Token> tokens = tokenProvider.getUserTokens(user.get());
            if (tokens.size() >= 1) {
                throw new AccountResourceException("No more than one token can be created");
            } else {
                // if there is a token already available, we should use the same expiration date
                // we only renew the token after validating the account is valid on half year basis
                if (tokens.size() > 0) {
                    return tokenProvider.createTokenForCurrentUserLogin(Optional.of(tokens.iterator().next().getExpiration()));
                } else {
                    return tokenProvider.createTokenForCurrentUserLogin(Optional.empty());
                }
            }
        } else {
            throw new AccountResourceException("User is not logged in");
        }
    }

    /**
     * {@code DELETE  /account/tokens} : create a new token for the current user's token.
     *
     * @return the new token
     */
    @DeleteMapping(path = "/account/tokens")
    public void deleteToken(@RequestBody Token token) throws AuthenticationException {
        Optional<String> userLogin = SecurityUtils.getCurrentUserLogin();
        if (userLogin.isPresent() && token.getUser() != null) {
            if (token.getUser().getLogin().equalsIgnoreCase(userLogin.get())) {
                tokenProvider.expireToken(token);
            } else {
                throw new AuthenticationException("User does not have the permission to update the token requested");
            }
        } else {
            throw new AccountResourceException("User is not logged in");
        }
    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param mail the mail of the user.
     */
    @PostMapping(path = "/account/reset-password/init")
    public void requestPasswordReset(@RequestBody String mail) {
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(userMapper.userToUserDTO(user.get()));
        } else {
            // Pretend the request has been successful to prevent checking which emails really exist
            // but log that an invalid attempt has been made
            log.warn("Password reset requested for non existing mail '{}'", mail);
        }
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException         {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public void finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (!checkPasswordLength(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user =
            userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());

        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this reset key");
        }
    }

    private static boolean checkPasswordLength(String password) {
        return !StringUtils.isEmpty(password) &&
            password.length() >= ManagedUserVM.PASSWORD_MIN_LENGTH &&
            password.length() <= ManagedUserVM.PASSWORD_MAX_LENGTH;
    }
}
