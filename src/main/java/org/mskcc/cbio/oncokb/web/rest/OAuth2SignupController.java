package org.mskcc.cbio.oncokb.web.rest;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.AccountRequestStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.security.DomainUserDetailsService;
import org.mskcc.cbio.oncokb.security.uuid.UUIDFilter;
import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserAuthenticationTokenService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.ApiAccessRequest;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.EmailAlreadyUsedException;
import org.mskcc.cbio.oncokb.web.rest.vm.KeycloakSignupUser;
import org.mskcc.cbio.oncokb.web.rest.vm.MskSignupVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * This controller handles the signup flow for users authenticating with Keycloak for the first time.
 */
@RestController
@RequestMapping("/oauth2")
public class OAuth2SignupController {
    private static final String MSK_DEFAULT_CITY = "New York";
    private static final String MSK_DEFAULT_COUNTRY = "USA";
    private static final String MSK_COMPANY_NAME = "MSKCC";
    private static final String COMPANY_NOT_FOUND_ERROR =
        "There was an error completing your signup. Please reach out to the OncoKB team.";

    private final Logger log = LoggerFactory.getLogger(OAuth2SignupController.class);

    private final UserAuthenticationTokenService userAuthenticationTokenService;
    private final UserService userService;
    private final DomainUserDetailsService domainUserDetailsService;
    private final SlackService slackService;
    private final UserMapper userMapper;
    private final CompanyRepository companyRepository;

    public OAuth2SignupController(
        UserAuthenticationTokenService userAuthenticationTokenService,
        UserService userService,
        DomainUserDetailsService domainUserDetailsService,
        SlackService slackService,
        UserMapper userMapper,
        CompanyRepository companyRepository
    ) {
        this.userAuthenticationTokenService = userAuthenticationTokenService;
        this.userService = userService;
        this.domainUserDetailsService = domainUserDetailsService;
        this.slackService = slackService;
        this.userMapper = userMapper;
        this.companyRepository = companyRepository;
    }

    @GetMapping("/signup-user")
    public KeycloakSignupUser getSignupUser(Authentication authentication) {
        OidcUser oidcUser = getOidcUser(authentication);
        String email = oidcUser.getEmail();
        if (StringUtils.isBlank(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Keycloak account does not include an email address.");
        }
        if (userService.getUserWithAuthoritiesByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An OncoKB account already exists for this email address.");
        }
        return new KeycloakSignupUser(
            email,
            getNameClaim(oidcUser, "given_name").orElse(""),
            getNameClaim(oidcUser, "family_name").orElse("")
        );
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<UUID> completeSignup(
        Authentication authentication,
        @Valid @RequestBody MskSignupVM signup
    ) {
        OidcUser oidcUser = getOidcUser(authentication);
        String email = oidcUser.getEmail();
        if (StringUtils.isBlank(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Keycloak account does not include an email address.");
        }
        if (userService.getUserWithAuthoritiesByEmailIgnoreCase(email).isPresent()) {
            throw new EmailAlreadyUsedException();
        }
        if (signup.isApiAccessRequested() && StringUtils.isBlank(signup.getApiAccessJustification())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Justification is required if requesting API access.");
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setLogin(email);
        userDTO.setEmail(email);
        userDTO.setFirstName(signup.getFirstName().trim());
        userDTO.setLastName(signup.getLastName().trim());
        userDTO.setLicenseType(LicenseType.ACADEMIC);
        userDTO.setJobTitle(signup.getJobTitle().trim());
        userDTO.setCompanyName(MSK_COMPANY_NAME);
        userDTO.setCity(MSK_DEFAULT_CITY);
        userDTO.setCountry(MSK_DEFAULT_COUNTRY);
        userDTO.setActivated(true);
        userDTO.setAccountRequestStatus(AccountRequestStatus.APPROVED);

        Set<String> authorities = new HashSet<>(Arrays.asList(AuthoritiesConstants.USER));
        if (signup.isApiAccessRequested()) {
            AdditionalInfoDTO additionalInfo = new AdditionalInfoDTO();
            ApiAccessRequest apiAccessRequest = new ApiAccessRequest();
            apiAccessRequest.setRequested(true);
            apiAccessRequest.setJustification(signup.getApiAccessJustification().trim());
            additionalInfo.setApiAccessRequest(apiAccessRequest);
            userDTO.setAdditionalInfo(additionalInfo);
        }
        userDTO.setAuthorities(authorities);

        User user = userService.createUser(userDTO, false, Optional.empty(), Optional.of(true));
        applyMskCompanyFlow(userMapper.userToUserDTO(user), signup.isApiAccessRequested());
        setLocalAuthentication(user.getEmail(), oidcUser);

        return buildTokenResponse(userAuthenticationTokenService.authorizeCurrentUser());
    }

    private OidcUser getOidcUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Keycloak login is required.");
        }
        return Optional.of(authentication)
            .map(Authentication::getPrincipal)
            .filter(OidcUser.class::isInstance)
            .map(OidcUser.class::cast)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Keycloak login is required."));
    }

    private void setLocalAuthentication(String email, OidcUser oidcUser) {
        UserDetails userDetails = domainUserDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken localAuthentication =
            new UsernamePasswordAuthenticationToken(userDetails, oidcUser.getIdToken().getTokenValue(), userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(localAuthentication);
    }

    private ResponseEntity<UUID> buildTokenResponse(UUID uuid) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(UUIDFilter.AUTHORIZATION_HEADER, "Bearer " + uuid);
        return new ResponseEntity<>(uuid, httpHeaders, HttpStatus.OK);
    }

    private Optional<String> getNameClaim(OidcUser oidcUser, String claim) {
        return Optional.ofNullable(oidcUser.getClaimAsString(claim))
            .map(String::trim)
            .filter(StringUtils::isNotBlank);
    }

    // Adds user to MSK company and sends Slack notification. We can make this more generic in future
    // if we want to add users from other institutions/copmpanies to their respective companies during signup.
    private void applyMskCompanyFlow(UserDTO userDTO, boolean apiAccessRequested) {
        Optional<Company> mskCompany = companyRepository.findOneByNameIgnoreCase(MSK_COMPANY_NAME);
        if (!mskCompany.isPresent()) {
            log.error("MSK signup could not associate user {} with company `{}` because it was not found.", userDTO.getLogin(), MSK_COMPANY_NAME);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, COMPANY_NOT_FOUND_ERROR);
        }

        Company company = mskCompany.get();
        UserDTO updatedUserDTO = userService.updateUserWithCompanyLicense(userDTO, company, false, false).orElse(userDTO);

        if (apiAccessRequested) {
            slackService.sendUserRegistrationToChannel(updatedUserDTO, false, company);
        } else {
            slackService.sendApprovedConfirmation(updatedUserDTO, company);
        }
    }
}
