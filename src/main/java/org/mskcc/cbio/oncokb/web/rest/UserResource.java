package org.mskcc.cbio.oncokb.web.rest;

import io.github.jhipster.web.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;

import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.springframework.data.domain.Sort;

import java.util.*;

import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.mskcc.cbio.oncokb.web.rest.errors.EmailAlreadyUsedException;
import org.mskcc.cbio.oncokb.web.rest.errors.LoginAlreadyUsedException;
import org.mskcc.cbio.oncokb.web.rest.vm.ManagedUserVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.mail.MessagingException;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;

/**
 * REST controller for managing users.
 * <p>
 * This class accesses the {@link User} entity, and needs to fetch its collection of authorities.
 * <p>
 * For a normal use-case, it would be better to have an eager relationship between User and Authority,
 * and send everything to the client side: there would be no View Model and DTO, a lot less code, and an outer-join
 * which would be good for performance.
 * <p>
 * We use a View Model and a DTO for 3 reasons:
 * <ul>
 * <li>We want to keep a lazy association between the user and the authorities, because people will
 * quite often do relationships with the user, and we don't want them to get the authorities all
 * the time for nothing (for performance reasons). This is the #1 goal: we should not impact our users'
 * application because of this use-case.</li>
 * <li> Not having an outer join causes n+1 requests to the database. This is not a real issue as
 * we have by default a second-level cache. This means on the first HTTP call we do the n+1 requests,
 * but then all authorities come from the cache, so in fact it's much better than doing an outer join
 * (which will get lots of data from the database, for each HTTP call).</li>
 * <li> As this manages users, for security reasons, we'd rather have a DTO layer.</li>
 * </ul>
 * <p>
 * Another option would be to have a specific JPA entity graph to handle this case.
 */
@RestController
@RequestMapping("/api")
public class UserResource {
    private static final List<String> ALLOWED_ORDERED_PROPERTIES = Collections.unmodifiableList(Arrays.asList("id", "login", "firstName", "lastName", "email", "activated", "langKey"));

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserService userService;

    @Autowired
    private UserMapper userMapper;

    private final UserRepository userRepository;

    private final MailService mailService;

    private final TokenService tokenService;

    public UserResource(
        UserService userService,
        UserRepository userRepository,
        MailService mailService,
        TokenService tokenService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.tokenService = tokenService;
    }

    /**
     * {@code POST  /users}  : Creates a new user.
     * <p>
     * Creates a new user if the login and email are not already used, and sends an
     * mail with an activation link.
     * The user needs to be activated on creation.
     *
     * @param managedUserVM the user to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new user, or with status {@code 400 (Bad Request)} if the login or email is already in use.
     * @throws URISyntaxException       if the Location URI syntax is incorrect.
     * @throws BadRequestAlertException {@code 400 (Bad Request)} if the login or email is already in use.
     */
    @PostMapping("/users")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<User> createUser(@Valid @RequestBody ManagedUserVM managedUserVM) throws URISyntaxException, MessagingException {
        log.debug("REST request to save User : {}", managedUserVM);

        if (managedUserVM.getId() != null) {
            throw new BadRequestAlertException("A new user cannot already have an ID", "userManagement", "idexists");
            // Lowercase the user login before comparing with database
        } else if (userRepository.findOneWithAuthoritiesByLogin(managedUserVM.getLogin().toLowerCase()).isPresent()) {
            throw new LoginAlreadyUsedException();
        } else if (userRepository.findOneWithAuthoritiesByEmailIgnoreCase(managedUserVM.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException();
        } else {
            // Assign ROLE_USER to all new accounts
            // All other authorities can be updated in the user management page
            if (managedUserVM.getAuthorities() == null || managedUserVM.getAuthorities().isEmpty()) {
                Set<String> authorities = new LinkedHashSet<>();
                authorities.add(AuthoritiesConstants.USER);
                if (!managedUserVM.getLicenseType().equals(LicenseType.ACADEMIC)) {
                    authorities.add(AuthoritiesConstants.API);
                }
                managedUserVM.setAuthorities(Collections.unmodifiableSet(authorities));
            }
            User newUser = userService.createUser(managedUserVM, Optional.ofNullable(managedUserVM.getTokenValidDays()), Optional.ofNullable(managedUserVM.getTokenIsRenewable()));
            UserDTO newUserDTO = userMapper.userToUserDTO(newUser);
            if (managedUserVM.getNotifyUserOnTrialCreation()) {
                userService.initiateTrialAccountActivation(newUser.getLogin());
                mailService.sendActiveTrialMail(newUserDTO, true);
            } else {
                mailService.sendCreationEmail(newUserDTO);
            }
            return ResponseEntity.created(new URI("/api/users/" + newUser.getLogin()))
                .body(newUser);
        }
    }

    /**
     * {@code PUT /users} : Updates an existing User.
     *
     * @param userDTO the user to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated user.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already in use.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already in use.
     */
    @PutMapping("/users")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<UserDTO> updateUser(
        @Valid @RequestBody UserDTO userDTO,
        @NotNull @RequestParam Boolean sendEmail,
        @NotNull @RequestParam Boolean unlinkUser
    ) {
        log.debug("REST request to update User : {}", userDTO);
        Optional<User> existingUser = userRepository.findOneWithAuthoritiesByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(userDTO.getId()))) {
            throw new EmailAlreadyUsedException();
        }
        existingUser = userRepository.findOneWithAuthoritiesByLogin(userDTO.getLogin().toLowerCase());
        if (existingUser.isPresent() && (!existingUser.get().getId().equals(userDTO.getId()))) {
            throw new LoginAlreadyUsedException();
        }

        // Remove mapping between the user and the company
        if(existingUser.isPresent() && unlinkUser){
            userDTO.setCompany(null);
        }

        Optional<UserDTO> updatedUser;
        if (existingUser.isPresent() && !existingUser.get().getActivated() && userDTO.isActivated()) {
            updatedUser = userService.updateUserAndTokens(userDTO);
        } else {
            updatedUser = userService.updateUserFromUserDTO(userDTO);
        }

        if(updatedUser.isPresent() && sendEmail && updatedUser.get().isActivated()) {
            mailService.sendApprovalEmail(updatedUser.get());
        }
        return ResponseUtil.wrapOrNotFound(updatedUser);
    }

    /**
     * {@code GET /users} : get all users.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body all users.
     */
    @GetMapping("/users")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return new ResponseEntity<>(userService.getAllManagedUsers(), HttpStatus.OK);
    }

    /**
     * {@code GET /users/registered} : get all registered user deatils.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body all users.
     */
    @GetMapping("/users/registered")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<UserDTO>> getAllRegisteredUsers(Pageable pageable) {
        final Page<UserDTO> page = userService.getAllRegisteredUsers(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }


    private boolean onlyContainsAllowedProperties(Pageable pageable) {
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }

    /**
     * Gets a list of all roles.
     *
     * @return a string list of all roles.
     */
    @GetMapping("/users/authorities")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public List<String> getAuthorities() {
        return userService.getAuthorities();
    }

    /**
     * Get emails of users that are not part of a company
     *
     * @return user emails
     */
    @GetMapping("/users/non-company-emails")
    public List<String> getNonCompanyUserEmails() {
        return userService.getNonCompanyUserEmails();
    }

    /**
     * {@code GET /users/:login} : get the "login" user.
     *
     * @param login the login of the user to find.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the "login" user, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/users/{login:" + Constants.LOGIN_REGEX + "}")
    public ResponseEntity<UserDTO> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return ResponseUtil.wrapOrNotFound(
            userService.getUserWithAuthoritiesByLogin(login)
                .map(user -> userMapper.userToUserDTO(user)));
    }

    /**
     * {@code DELETE /users/:login} : delete the "login" User.
     *
     * @param login the login of the user to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/users/{login:" + Constants.LOGIN_REGEX + "}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteUser(@PathVariable String login) {
        log.debug("REST request to delete User: {}", login);
        userService.deleteUser(login);
        return ResponseEntity.ok().build();
    }

    /**
     * {@code GET /users/:login/tokens} : get all tokens for the "login" user.
     *
     * @param login the login of the user to find.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the list of tokens, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/users/{login:" + Constants.LOGIN_REGEX + "}/tokens")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<Token>> getUserTokens(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        Optional<User> optionalUser = userService.getUserWithAuthoritiesByLogin(login);
        if (!optionalUser.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(tokenService.findByUser(optionalUser.get()), HttpStatus.OK);
    }

    @PostMapping("/users/tokens")
    public ResponseEntity<List<Token>> getUsersTokens(@RequestBody List<String> logins){
        log.debug("REST request to get tokens of each user");
        List<Token> usersTokens = new ArrayList<>();
        for(String login: logins){
            Optional<User> optionalUser = userService.getUserWithAuthoritiesByLogin(login);
            if (optionalUser.isPresent()) {
                usersTokens.addAll(tokenService.findByUser(optionalUser.get()));
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }
        return new ResponseEntity<>(usersTokens, HttpStatus.OK);
    }

}
