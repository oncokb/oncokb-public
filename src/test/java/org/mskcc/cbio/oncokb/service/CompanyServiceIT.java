package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.CompanyCandidate;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.domain.enumeration.CompanyType;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseModel;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyMapper;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mskcc.cbio.oncokb.config.Constants.DEFAULT_TOKEN_EXPIRATION_IN_DAYS;

/**
 * Integration tests for {@link CompanyService}.
 */
@SpringBootTest(classes = OncokbPublicApp.class)
@Transactional
public class CompanyServiceIT {

    private static final String DEFAULT_LOGIN = "johndoe";

    private static final String DEFAULT_EMAIL = "johndoe@localhost";

    private static final String DEFAULT_FIRSTNAME = "john";

    private static final String DEFAULT_LASTNAME = "doe";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";

    private static final CompanyType DEFAULT_COMPANY_TYPE = CompanyType.PARENT;

    private static final LicenseType DEFAULT_LICENSE_TYPE = LicenseType.ACADEMIC;

    private static final LicenseModel DEFAULT_LICENSE_MODEL = LicenseModel.FULL;

    private static final LicenseStatus DEFAULT_LICENSE_STATUS = LicenseStatus.REGULAR;

    private static final String DEFAULT_BUSINESS_CONTACT = "AAAAAAAAAA";

    private static final String DEFAULT_LEGAL_CONTACT = "AAAAAAAAAA";

    private static final String[] DEFAULT_COMPANY_DOMAIN_NAMES = new String[] {"oncokb.org"};

    private static final Set<String> DEFAULT_COMPANY_DOMAINS = new HashSet<>(Arrays.asList(DEFAULT_COMPANY_DOMAIN_NAMES));

    private static final Long timeDiffToleranceInMilliseconds = 1000L;

    private UserDTO userDTO;

    private CompanyDTO companyDTO;

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserDetailsService userDetailsService;

    @Autowired
    CompanyService companyService;

    @Autowired
    CompanyRepository companyRepository;

    @Autowired
    CompanyMapper companyMapper;

    @Autowired
    UserMapper userMapper;

    @Autowired
    TokenService tokenService;

    @Autowired
    CompanyDomainRepository companyDomainRepository;

    @BeforeEach
    public void init() {
        //Create a default companyDTO
        companyDTO = new CompanyDTO();
        companyDTO.setName(DEFAULT_NAME);
        companyDTO.setDescription(DEFAULT_DESCRIPTION);
        companyDTO.setCompanyType(DEFAULT_COMPANY_TYPE);
        companyDTO.setLicenseType(DEFAULT_LICENSE_TYPE);
        companyDTO.setLicenseModel(DEFAULT_LICENSE_MODEL);
        companyDTO.setLicenseStatus(DEFAULT_LICENSE_STATUS);
        companyDTO.setBusinessContact(DEFAULT_BUSINESS_CONTACT);
        companyDTO.setLegalContact(DEFAULT_LEGAL_CONTACT);
        companyDTO.setCompanyDomains(DEFAULT_COMPANY_DOMAINS);

        // Create a default user
        userDTO = new UserDTO();
        userDTO.setLogin(DEFAULT_LOGIN);
        userDTO.setEmail(DEFAULT_EMAIL);
        userDTO.setFirstName(DEFAULT_FIRSTNAME);
        userDTO.setLastName(DEFAULT_LASTNAME);
        userDTO.setActivated(false);
        userDTO.setLicenseType(DEFAULT_LICENSE_TYPE);
    }

    // Use this to create a default CompanyVM
    public static CompanyVM createCompanyVM(CompanyDTO companyDTO) {
        CompanyVM companyVM = new CompanyVM();
        companyVM.setId(companyDTO.getId());
        companyVM.setName(companyDTO.getName());
        companyVM.setDescription(companyDTO.getDescription());
        companyVM.setCompanyType(companyDTO.getCompanyType());
        companyVM.setLicenseType(companyDTO.getLicenseType());
        companyVM.setLicenseModel(companyDTO.getLicenseModel());
        companyVM.setLicenseStatus(companyDTO.getLicenseStatus());
        companyVM.setBusinessContact(companyDTO.getBusinessContact());
        companyVM.setLegalContact(companyDTO.getLegalContact());
        companyVM.setCompanyDomains(companyDTO.getCompanyDomains());
        return companyVM;
    }

    @Test
    @Transactional
    public void assertThatNewUserIsAssociatedWithCompany() {
        // Initialize database
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        userDTO.setLicenseType(LicenseType.RESEARCH_IN_COMMERCIAL); // Different license type from company
        User newUser = userService.createUser(userDTO, Optional.empty(), Optional.empty());

        // Add user to the company
        CompanyVM updatedCompany = createCompanyVM(existingCompany);
        updatedCompany.setCompanyUserEmails(Collections.singletonList(DEFAULT_EMAIL));

        // Check if user is updated with the company information
        companyService.updateCompany(updatedCompany);
        Optional<User> optionalUser = userRepository.findOneById(newUser.getId());
        assertThat(optionalUser).isPresent();
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        assertThat(userDTO.getCompanyName()).isEqualTo(DEFAULT_NAME);
        assertThat(userDTO.getCompany()).isNotNull();
        assertThat(userDTO.getCompany().getId()).isEqualTo(existingCompany.getId());
        assertThat(userDTO.getLicenseType()).isEqualTo(DEFAULT_LICENSE_TYPE);
        assertThat(userDTO.isActivated()).isTrue();
    }

    /**
     * The following tests verify the user's information after the company license status is changed
     */
    @Test
    @Transactional
    public void assertThatUserIsRegularWhenCompanyOnRegularLicense() {
        // Initialize database
        companyDTO.setLicenseStatus(LicenseStatus.TRIAL);
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        User newUser = userService.createUser(userDTO, Optional.empty(), Optional.empty());
        CompanyVM companyVM = createCompanyVM(existingCompany);
        companyVM.setCompanyUserEmails(Collections.singletonList(DEFAULT_EMAIL));
        companyService.updateCompany(companyVM);

        // Change license to regular
        CompanyVM updatedCompanyVM = createCompanyVM(existingCompany);
        updatedCompanyVM.setLicenseStatus(LicenseStatus.REGULAR);
        companyService.updateCompany(updatedCompanyVM);

        // Check assumptions
        Optional<User> optionalUser = userRepository.findOneById(newUser.getId());
        assertThat(optionalUser).isPresent();
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        assertThat(userDTO.isActivated()).isTrue();
        assertThat(userDTO.getAdditionalInfo()).isNull();
        // Check tokens are renewable
        List<Token> tokens = tokenService.findByUser(userMapper.userDTOToUser(userDTO));
        assertThat(tokens).extracting(Token::isRenewable).allMatch(renewable -> renewable.equals(true));
    }

    @Test
    @Transactional
    public void assertThatActivatedTrialUserIsConvertedWhenCompanyOnRegularLicense() {
        // Initialize database
        companyDTO.setLicenseStatus(LicenseStatus.TRIAL);
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        User newUser = userService.createUser(userDTO, Optional.empty(), Optional.empty());
        userService.initiateTrialAccountActivation(newUser.getLogin());
        CompanyVM companyVM = createCompanyVM(existingCompany);
        companyVM.setCompanyUserEmails(Collections.singletonList(DEFAULT_EMAIL));
        companyService.updateCompany(companyVM);

        // Activate trial
        Optional<User> optionalUserPre = userRepository.findOneById(newUser.getId());
        UserDTO userDTOPre = userMapper.userToUserDTO(optionalUserPre.get());
        userService.finishTrialAccountActivation(userDTOPre.getAdditionalInfo().getTrialAccount().getActivation().getKey());

        // Change license to regular
        CompanyVM updatedCompanyVM = createCompanyVM(existingCompany);
        updatedCompanyVM.setLicenseStatus(LicenseStatus.REGULAR);
        companyService.updateCompany(updatedCompanyVM);

        // Check assumptions
        Optional<User> optionalUserPost = userRepository.findOneById(newUser.getId());
        UserDTO userDTOPost = userMapper.userToUserDTO(optionalUserPost.get());
        assertThat(userDTOPost.getAdditionalInfo()).isNotNull();
        assertThat(userDTOPost.getAdditionalInfo().getTrialAccount()).isNotNull();
        assertThat(userDTOPost.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate())
            .isCloseTo(Instant.now(), within(timeDiffToleranceInMilliseconds, ChronoUnit.MILLIS));
        List<Token> tokens = tokenService.findByUser(userMapper.userDTOToUser(userDTOPost));
        assertThat(tokens).extracting(Token::isRenewable).allMatch(renewable -> renewable.equals(true));
    }


    @Test
    @Transactional
    public void assertThatUserOnTrialWhenCompanyOnTrialLicense() {
        // Initialize database
        companyDTO.setLicenseStatus(LicenseStatus.REGULAR);
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        User newUser = userService.createUser(userDTO, Optional.empty(), Optional.empty());
        CompanyVM companyVM = createCompanyVM(existingCompany);
        companyVM.setCompanyUserEmails(Collections.singletonList(DEFAULT_EMAIL));
        companyService.updateCompany(companyVM);

        // Change license to trial
        CompanyVM updatedCompanyVM = createCompanyVM(existingCompany);
        updatedCompanyVM.setLicenseStatus(LicenseStatus.TRIAL);
        companyService.updateCompany(updatedCompanyVM);

        // Check assumptions
        Optional<User> optionalUser = userRepository.findOneById(newUser.getId());
        assertThat(optionalUser).isPresent();
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        assertThat(userDTO.isActivated()).isTrue();
        assertThat(userDTO.getAdditionalInfo().getTrialAccount()).isNotNull();
        assertThat(userDTO.getAdditionalInfo().getTrialAccount().getActivation().getInitiationDate())
            .isCloseTo(Instant.now(), within(timeDiffToleranceInMilliseconds, ChronoUnit.MILLIS));
    }

    @Test
    @Transactional
    public void assertThatUserTokenExpireAfterCompanyLicenseExpire() {
        // Initialize database
        companyDTO.setLicenseStatus(LicenseStatus.REGULAR);
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        User newUser = userService.createUser(userDTO, Optional.empty(), Optional.empty());
        CompanyVM companyVM = createCompanyVM(existingCompany);
        companyVM.setCompanyUserEmails(Collections.singletonList(DEFAULT_EMAIL));
        companyService.updateCompany(companyVM);

        // Expire the company's license
        CompanyVM updatedCompanyVM = createCompanyVM(existingCompany);
        updatedCompanyVM.setLicenseStatus(LicenseStatus.EXPIRED);
        companyService.updateCompany(updatedCompanyVM);

        // Check assumptions
        Optional<User> optionalUser = userRepository.findOneById(newUser.getId());
        assertThat(optionalUser).isPresent();
        UserDTO userDTO = userMapper.userToUserDTO(optionalUser.get());
        assertThat(userDTO.isActivated()).isFalse(); // user should be deactivated
        List<Token> tokens = tokenService.findByUser(userMapper.userDTOToUser(userDTO));
        assertThat(tokens.get(0).getExpiration())
            .isCloseTo(Instant.now(), within(timeDiffToleranceInMilliseconds, ChronoUnit.MILLIS)); // token should be expired
    }

    /**
     * The following tests verify whether the correct company is found based on the user's email address
     */
    @Test
    @Transactional
    public void assertThatCompanyNotFoundIfEmailDoesNotMatch() {
        // Initialize database
        companyService.createCompany(companyDTO);
        userDTO.setEmail("user@gmail.com");  // This email does not match company

        CompanyCandidate companyCandidate = userService.findCompanyCandidate(userDTO);
        assertThat(companyCandidate.getCanAssociate()).isFalse();
        assertThat(companyCandidate.getCompanyCandidate()).isNotPresent();
    }

    @Test
    @Transactional
    public void assertThatRegularCompanyFoundIfEmailMatch() {
        // Initialize database
        companyDTO.setLicenseModel(LicenseModel.FULL);
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        userDTO.setEmail("user@oncokb.org");  // This email matches company

        CompanyCandidate companyCandidate = userService.findCompanyCandidate(userDTO);
        assertThat(companyCandidate.getCanAssociate()).isTrue();
        assertThat(companyCandidate.getCompanyCandidate()).isPresent();
        assertThat(companyCandidate.getCompanyCandidate().get().getId()).isEqualTo(existingCompany.getId());
    }

    @Test
    @Transactional
    public void assertThatMicroCompanyFoundIfEmailMatch() {
        // Initialize database
        companyDTO.setLicenseModel(LicenseModel.LIMITED);
        CompanyDTO existingCompany = companyService.createCompany(companyDTO);
        userDTO.setEmail("user@oncokb.org");  // This email matches company

        CompanyCandidate companyCandidate = userService.findCompanyCandidate(userDTO);
        assertThat(companyCandidate.getCanAssociate()).isFalse();
        assertThat(companyCandidate.getCompanyCandidate()).isPresent();
        assertThat(companyCandidate.getCompanyCandidate().get().getId()).isEqualTo(existingCompany.getId());
    }

    /**
     * Tests whether the findCompanyUsers returns all the user associated with a company
     */
    @Test
    @Transactional
    public void assertThatCompanyUsersFound(){
        Company company = companyRepository.saveAndFlush(companyMapper.toEntity(companyDTO));
        CompanyVM companyVM = createCompanyVM(companyMapper.toDto(company));
        userService.createUser(userDTO, Optional.empty(), Optional.empty());
        companyVM.setCompanyUserEmails(Collections.singletonList(DEFAULT_EMAIL));
        companyService.updateCompany(companyVM);

        List<UserDTO> companyUsers = userService.getCompanyUsers(company.getId());
        assertThat(companyUsers).hasSameSizeAs(companyVM.getCompanyUserEmails());
        assertThat(companyUsers.get(0).getCompany()).isNotNull();
        assertThat(companyUsers.get(0).getCompany().getId()).isEqualTo(company.getId());
    }

    @Test
    @Transactional
    public void assertThatTrialUserExpirationWillBeExtendedAfterLinkedWithTrialCompany() {
        userService.createUser(userDTO, Optional.empty(), Optional.empty());

        Optional<User> userOptional = userService.initiateTrialAccountActivation(userDTO.getLogin());
        assertThat(userOptional.isPresent()).isTrue();

        User user = userOptional.get();
        Optional<UserDetailsDTO> userDetailsDTO = userDetailsService.findOneByUser(user);
        userService.finishTrialAccountActivation(userDetailsDTO.get().getAdditionalInfo().getTrialAccount().getActivation().getKey());

        Instant userTokenExpirationDate = Instant.now().plusSeconds(1000);
        tokenService.findByUser(user).forEach(token -> {
            token.setExpiration(userTokenExpirationDate);
            tokenService.save(token);
        });

        // Create a trial company
        companyDTO.setLicenseStatus(LicenseStatus.TRIAL);
        companyDTO = companyService.createCompany(companyDTO);

        // Associate user with company
        CompanyVM companyVM = createCompanyVM(companyDTO);
        companyVM.setCompanyUserEmails(Collections.singletonList(user.getEmail()));
        companyService.updateCompany(companyVM);

        // user's token expiration should be extended
        assertThat(tokenService.findByUser(user).stream().filter(token -> token.getExpiration().isAfter(userTokenExpirationDate)).count()).isEqualTo(1);
    }

    @Test
    @Transactional
    public void assertThatTrialUserExpirationWillRemainIfLongerThanDefaultAfterLinkedWithTrialCompany() {
        userService.createUser(userDTO, Optional.empty(), Optional.empty());

        Optional<User> userOptional = userService.initiateTrialAccountActivation(userDTO.getLogin());
        assertThat(userOptional.isPresent()).isTrue();

        User user = userOptional.get();
        Optional<UserDetailsDTO> userDetailsDTO = userDetailsService.findOneByUser(user);
        userService.finishTrialAccountActivation(userDetailsDTO.get().getAdditionalInfo().getTrialAccount().getActivation().getKey());

        Instant userTokenExpirationDate = Instant.now().plusSeconds(60 * 60 * 24 * 100);
        tokenService.findByUser(user).forEach(token -> {
            token.setExpiration(userTokenExpirationDate);
            tokenService.save(token);
        });

        // Create ta trial company
        companyDTO.setLicenseStatus(LicenseStatus.TRIAL);
        companyDTO = companyService.createCompany(companyDTO);

        // Associate user with company
        CompanyVM companyVM = createCompanyVM(companyDTO);
        companyVM.setCompanyUserEmails(Collections.singletonList(user.getEmail()));
        companyService.updateCompany(companyVM);

        // user's token expiration should remain the same
        assertThat(tokenService.findByUser(user).stream().filter(token -> token.getExpiration().equals(userTokenExpirationDate)).count()).isEqualTo(1);
    }

    @Test
    @Transactional
    public void assertThatExpiredUserStatusWillChangeToTrialAfterLinkedWithTrialCompany() {
        User user = userService.createUser(userDTO, Optional.of(DEFAULT_TOKEN_EXPIRATION_IN_DAYS), Optional.of(Boolean.TRUE));
        userDTO = userMapper.userToUserDTO(user);
        userDTO.setActivated(false);
        userService.updateUser(userDTO);
        // The user expired at this moment

        // Create ta trial company
        companyDTO.setLicenseStatus(LicenseStatus.TRIAL);
        companyDTO = companyService.createCompany(companyDTO);

        // Associate user with company
        CompanyVM companyVM = createCompanyVM(companyDTO);
        companyVM.setCompanyUserEmails(Collections.singletonList(userDTO.getEmail()));
        companyService.updateCompany(companyVM);

        user = userService.getUserByLogin(userDTO.getLogin()).get();

        // user should have the trial agreement initiated, but user needs to agree with the terms before activating
        UserDTO latestUserDTO = userMapper.userToUserDTO(user);
        assertThat(userService.userHasUnactivatedTrial(latestUserDTO)).isTrue();
        assertThat(userService.isUserOnTrial(latestUserDTO)).isFalse();
        userService.finishTrialAccountActivation(latestUserDTO.getAdditionalInfo().getTrialAccount().getActivation().getKey());
        assertThat(userService.userHasUnactivatedTrial(latestUserDTO)).isTrue();
        assertThat(userService.isUserOnTrial(latestUserDTO)).isTrue();

        // user token should not be renewable
        assertThat(tokenService.findByUser(user).stream().filter(token->token.isRenewable()).count()).isEqualTo(0);
    }

    @Test
    @Transactional
    public void assertThatRegularUserStatusRemainTheSameAfterLinkedWithTrialCompany() {
        User user = userService.createUser(userDTO, Optional.of(DEFAULT_TOKEN_EXPIRATION_IN_DAYS), Optional.of(Boolean.TRUE));

        // Create ta trial company
        companyDTO.setLicenseStatus(LicenseStatus.TRIAL);
        companyDTO = companyService.createCompany(companyDTO);

        // Associate user with company
        CompanyVM companyVM = createCompanyVM(companyDTO);
        companyVM.setCompanyUserEmails(Collections.singletonList(user.getEmail()));
        companyService.updateCompany(companyVM);

        // user should not be on trial
        UserDTO latestUserDTO = userMapper.userToUserDTO(userService.getUserByLogin(userDTO.getLogin()).get());
        if (latestUserDTO.getAdditionalInfo() != null) {
            assertThat(latestUserDTO.getAdditionalInfo().getTrialAccount()).isNull();
        }
        assertThat(userService.isUserOnTrial(latestUserDTO)).isFalse();
        assertThat(latestUserDTO.isActivated()).isTrue();
    }

}
