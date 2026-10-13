package org.mskcc.cbio.oncokb.service.mapper;

import org.mskcc.cbio.oncokb.domain.Authority;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.domain.UserTrial;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserTrialRepository;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.UserTrialDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.Activation;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.LicenseAgreement;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.TrialAccount;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Mapper for the entity {@link User} and its DTO called {@link UserDTO}.
 *
 * Normal mappers are generated using MapStruct, this one is hand-coded as MapStruct
 * support is still in beta, and requires a manual step with an IDE.
 */
@Service
public class UserMapper {
    @Autowired
    UserDetailsRepository userDetailsRepository;

    @Autowired
    CompanyMapper companyMapper;

    @Autowired
    UserTrialRepository userTrialRepository;

    public List<UserDTO> usersToUserDTOs(List<User> users) {
        return users.stream()
            .filter(Objects::nonNull)
            .map(this::userToUserDTO)
            .collect(Collectors.toList()); 
    }

    public UserDTO userToUserDTO(User user) {
        Optional<UserDetails> userDetails = userDetailsRepository.findOneByUser(user);
        UserTrial userTrial = userTrialRepository.findOneByUser(user).orElse(null);
        return userToUserDTO(user, userDetails.orElse(null), userTrial);
    }

    public UserDTO userToUserDTO(User user, UserDetails userDetails) {
        UserTrial userTrial = userTrialRepository.findOneByUser(user).orElse(null);
        return userToUserDTO(user, userDetails, userTrial);
    }

    public UserDTO userToUserDTO(User user, UserDetails userDetails, UserTrial userTrial) {
        UserDTO userDTO = new UserDTO(user, userDetails);
        if (userDetails != null) {
            userDTO.setCompany(companyMapper.toDto(userDetails.getCompany()));
        }
        if (userTrial != null) {
            UserTrialDTO userTrialDTO = new UserTrialDTO();
            userTrialDTO.setId(userTrial.getId());
            userTrialDTO.setUserId(user.getId());
            userTrialDTO.setInitiationDate(userTrial.getInitiationDate());
            userTrialDTO.setInitiatedBy(userTrial.getInitiatedBy());
            userTrialDTO.setActivationDate(userTrial.getActivationDate());
            userTrialDTO.setActivationKey(userTrial.getActivationKey());
            userTrialDTO.setLicenseAgreementName(userTrial.getLicenseAgreementName());
            userTrialDTO.setLicenseAgreementVersion(userTrial.getLicenseAgreementVersion());
            userTrialDTO.setLicenseAgreementAcceptanceDate(userTrial.getLicenseAgreementAcceptanceDate());
            userDTO.setUserTrial(userTrialDTO);

            AdditionalInfoDTO additionalInfo = userDTO.getAdditionalInfo();
            if (additionalInfo == null) {
                additionalInfo = new AdditionalInfoDTO();
            }
            TrialAccount trialAccount = new TrialAccount();
            Activation activation = new Activation();
            activation.setInitiationDate(userTrial.getInitiationDate());
            activation.setInitiatedBy(userTrial.getInitiatedBy());
            activation.setActivationDate(userTrial.getActivationDate());
            activation.setKey(userTrial.getActivationKey());
            trialAccount.setActivation(activation);
            LicenseAgreement licenseAgreement = new LicenseAgreement();
            licenseAgreement.setName(userTrial.getLicenseAgreementName());
            licenseAgreement.setVersion(userTrial.getLicenseAgreementVersion());
            licenseAgreement.setAcceptanceDate(userTrial.getLicenseAgreementAcceptanceDate());
            trialAccount.setLicenseAgreement(licenseAgreement);
            additionalInfo.setTrialAccount(trialAccount);
            userDTO.setAdditionalInfo(additionalInfo);
        }
        return userDTO;
    }

    public List<User> userDTOsToUsers(List<UserDTO> userDTOs) {
        return userDTOs.stream()
            .filter(Objects::nonNull)
            .map(this::userDTOToUser)
            .collect(Collectors.toList());
    }

    public User userDTOToUser(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        } else {
            User user = new User();
            user.setId(userDTO.getId());
            user.setLogin(userDTO.getLogin());
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            user.setImageUrl(userDTO.getImageUrl());
            user.setActivated(userDTO.isActivated());
            user.setLangKey(userDTO.getLangKey());
            Set<Authority> authorities = this.authoritiesFromStrings(userDTO.getAuthorities());
            user.setAuthorities(authorities);
            return user;
        }
    }


    private Set<Authority> authoritiesFromStrings(Set<String> authoritiesAsString) {
        Set<Authority> authorities = new HashSet<>();

        if (authoritiesAsString != null) {
            authorities = authoritiesAsString.stream().map(string -> {
                Authority auth = new Authority();
                auth.setName(string);
                return auth;
            }).collect(Collectors.toSet());
        }

        return authorities;
    }

    public User userFromId(Long id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.setId(id);
        return user;
    }
}
