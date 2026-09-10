package org.mskcc.cbio.oncokb.security;

import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.internal.constraintvalidators.hv.EmailValidator;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.AccountRequestStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.TrialStatus;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.repository.UserTrialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class DomainUserDetailsService implements UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(DomainUserDetailsService.class);

    private final UserRepository userRepository;
    private final UserDetailsRepository userDetailsRepository;
    private final UserTrialRepository userTrialRepository;

    public DomainUserDetailsService(
        UserRepository userRepository,
        UserDetailsRepository userDetailsRepository,
        UserTrialRepository userTrialRepository
    ) {
        this.userRepository = userRepository;
        this.userDetailsRepository = userDetailsRepository;
        this.userTrialRepository = userTrialRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {
        log.debug("Authenticating {}", login);

        if (new EmailValidator().isValid(login, null)) {
            return userRepository.findOneWithAuthoritiesByEmailIgnoreCase(login)
                .map(user -> createSpringSecurityUser(login, user))
                .orElseThrow(() -> new UsernameNotFoundException("User with email " + login + " was not found in the database"));
        }

        String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);
        return userRepository.findOneWithAuthoritiesByLogin(lowercaseLogin)
            .map(user -> createSpringSecurityUser(lowercaseLogin, user))
            .orElseThrow(() -> new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the database"));

    }

    private org.springframework.security.core.userdetails.User createSpringSecurityUser(String lowercaseLogin, User user) {
        Optional<org.mskcc.cbio.oncokb.domain.UserDetails> userDetailsOptional = userDetailsRepository.findOneByUser(user);
        if (!userDetailsOptional.isPresent() || userDetailsOptional.get().getAccountRequestStatus().equals(AccountRequestStatus.UNKNOWN)) {
            log.warn("Account request status missing for user '{}'. Denying login.", user.getLogin());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account setup is incomplete. Please contact support.");
        }

        org.mskcc.cbio.oncokb.domain.UserDetails userDetails = userDetailsOptional.get();
        AccountRequestStatus accountRequestStatus = userDetails.getAccountRequestStatus();
        TrialStatus trialStatus = userDetails.getTrialStatus() == null ? TrialStatus.REGULAR : userDetails.getTrialStatus();

        if (AccountRequestStatus.REJECTED.equals(accountRequestStatus)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account request was rejected. Please contact contact@oncokb.org.");
        }

        if (TrialStatus.TRIAL_PENDING_TERMS_ACCEPTANCE.equals(trialStatus)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Your trial is approved but not active yet. Please accept the trial terms from your activation email."
            );
        }

        if (TrialStatus.TRIAL.equals(trialStatus)) {
            boolean hasAcceptedTerms = userTrialRepository.findOneByUser(user)
                .map(userTrial -> userTrial.getLicenseAgreementAcceptanceDate() != null)
                .orElse(false);
            if (!hasAcceptedTerms) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Trial activation is incomplete. Please use your activation link again or contact support."
                );
            }
        }

        if (!user.getActivated()) {
            if (StringUtils.isNotEmpty(user.getActivationKey())) {
                throw new UserNotActivatedException(lowercaseLogin);
            }

            if (AccountRequestStatus.APPROVED.equals(accountRequestStatus)) {
                throw new UserNotActivatedException(lowercaseLogin);
            }

            if (AccountRequestStatus.PENDING_NO_GRACE_PERIOD.equals(accountRequestStatus)) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is pending manual review. Grace period is not available for this account."
                );
            }

            if (!SecurityUtils.isWithinActivationGracePeriod(user, userDetails.getLicenseType())) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your temporary access expired while your request is still pending review."
                );
            }

            if (!AccountRequestStatus.PENDING.equals(accountRequestStatus)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is not approved yet.");
            }
        }
        List<GrantedAuthority> grantedAuthorities = user.getAuthorities().stream()
            .map(authority -> new SimpleGrantedAuthority(authority.getName()))
            .collect(Collectors.toList());
        return new org.springframework.security.core.userdetails.User(user.getLogin(),
            user.getPassword(),
            grantedAuthorities);
    }

}
