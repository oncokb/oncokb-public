package org.mskcc.cbio.oncokb.security;

import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.AccountRequestStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class OAuthAutoRegistrationService {

    private static final String MSK_COMPANY_NAME = "MSKCC";
    private static final String DEFAULT_CITY = "New York";
    private static final String DEFAULT_COUNTRY = "USA";
    private static final String DEFAULT_JOB_TITLE = "MSK Employee";
    private static final String SUPPORT_EMAIL = "support@oncokb.org";

    private final UserService userService;
    private final SlackService slackService;
    private final UserMapper userMapper;
    private final CompanyRepository companyRepository;

    public OAuthAutoRegistrationService(
        UserService userService,
        SlackService slackService,
        UserMapper userMapper,
        CompanyRepository companyRepository
    ) {
        this.userService = userService;
        this.slackService = slackService;
        this.userMapper = userMapper;
        this.companyRepository = companyRepository;
    }

    public User registerMskUser(String email, String firstName, String lastName, Optional<String> jobTitle) {
        UserDTO userDTO = new UserDTO();
        userDTO.setLogin(email);
        userDTO.setEmail(email);
        userDTO.setFirstName(firstName);
        userDTO.setLastName(lastName);
        userDTO.setLicenseType(LicenseType.ACADEMIC);
        userDTO.setJobTitle(jobTitle.orElse(DEFAULT_JOB_TITLE));
        userDTO.setCompanyName(MSK_COMPANY_NAME);
        userDTO.setCity(DEFAULT_CITY);
        userDTO.setCountry(DEFAULT_COUNTRY);
        userDTO.setActivated(true);
        userDTO.setAccountRequestStatus(AccountRequestStatus.APPROVED);

        Set<String> authorities = new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER));
        userDTO.setAuthorities(authorities);

        User user = userService.createUser(userDTO, false, Optional.empty(), Optional.of(true));
        applyMskCompanyFlow(userMapper.userToUserDTO(user));
        return user;
    }

    private void applyMskCompanyFlow(UserDTO userDTO) {
        Company company = companyRepository.findOneByNameIgnoreCase(MSK_COMPANY_NAME)
            .orElseThrow(() -> new IllegalStateException(
                "There was an error creating your MSK account. Please contact " + SUPPORT_EMAIL + "."
            ));

        UserDTO updatedUserDTO = userService.updateUserWithCompanyLicense(userDTO, company, false, false).orElse(userDTO);
        slackService.sendApprovedConfirmation(updatedUserDTO, company);
    }
}
