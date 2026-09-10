package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserTrial;
import org.mskcc.cbio.oncokb.service.UserDetailsService;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.repository.UserTrialRepository;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;
import org.mskcc.cbio.oncokb.service.dto.UserTrialDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserDetailsMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing {@link UserDetails}.
 */
@Service
@Transactional
public class UserDetailsServiceImpl implements UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    private final UserDetailsRepository userDetailsRepository;

    private final UserDetailsMapper userDetailsMapper;

    private final UserTrialRepository userTrialRepository;

    public UserDetailsServiceImpl(
        UserDetailsRepository userDetailsRepository,
        UserDetailsMapper userDetailsMapper,
        UserTrialRepository userTrialRepository
    ) {
        this.userDetailsRepository = userDetailsRepository;
        this.userDetailsMapper = userDetailsMapper;
        this.userTrialRepository = userTrialRepository;
    }

    @Override
    public UserDetailsDTO save(UserDetailsDTO userDetailsDTO) {
        log.debug("Request to save UserDetails : {}", userDetailsDTO);
        UserDetails userDetails = userDetailsMapper.toEntity(userDetailsDTO);
        userDetails = userDetailsRepository.save(userDetails);
        return attachUserTrial(userDetailsMapper.toDto(userDetails));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDetailsDTO> findAll() {
        log.debug("Request to get all UserDetails");
        return userDetailsRepository.findAll().stream()
            .map(userDetailsMapper::toDto)
            .map(this::attachUserTrial)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<UserDetailsDTO> findOne(Long id) {
        log.debug("Request to get UserDetails : {}", id);
        return userDetailsRepository.findById(id)
            .map(userDetailsMapper::toDto)
            .map(this::attachUserTrial);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete UserDetails : {}", id);
        userDetailsRepository.deleteById(id);
    }

    @Override
    public void deleteByUser(User user) {
        log.debug("Request to delete UserDetails by user : {}", user);
        userDetailsRepository.deleteByUser(user);
    }

    @Override
    public Optional<UserDetailsDTO> findOneByTrialActivationKey(String key) {
        return userTrialRepository.findOneByActivationKey(key)
            .map(UserTrial::getUser)
            .flatMap(userDetailsRepository::findOneByUser)
            .map(userDetailsMapper::toDto)
            .map(this::attachUserTrial);
    }

    @Override
    public Optional<UserDetailsDTO> findOneByUser(User user) {
        return userDetailsRepository.findOneByUser(user).map(userDetailsMapper::toDto).map(this::attachUserTrial);
    }

    @Override
    public Optional<UserDetailsDTO> findByUserIsCurrentUser() {
        return userDetailsRepository.findByUserIsCurrentUser()
            .map(userDetailsMapper::toDto)
            .map(this::attachUserTrial);
    }

    private UserDetailsDTO attachUserTrial(UserDetailsDTO userDetailsDTO) {
        if (userDetailsDTO == null || userDetailsDTO.getUserId() == null) {
            return userDetailsDTO;
        }
        userTrialRepository.findOneByUserId(userDetailsDTO.getUserId()).ifPresent(userTrial -> {
            UserTrialDTO userTrialDTO = new UserTrialDTO();
            userTrialDTO.setId(userTrial.getId());
            userTrialDTO.setUserId(userDetailsDTO.getUserId());
            userTrialDTO.setInitiationDate(userTrial.getInitiationDate());
            userTrialDTO.setInitiatedBy(userTrial.getInitiatedBy());
            userTrialDTO.setActivationDate(userTrial.getActivationDate());
            userTrialDTO.setActivationKey(userTrial.getActivationKey());
            userTrialDTO.setLicenseAgreementName(userTrial.getLicenseAgreementName());
            userTrialDTO.setLicenseAgreementVersion(userTrial.getLicenseAgreementVersion());
            userTrialDTO.setLicenseAgreementAcceptanceDate(userTrial.getLicenseAgreementAcceptanceDate());
            userDetailsDTO.setUserTrial(userTrialDTO);
        });
        return userDetailsDTO;
    }
}
