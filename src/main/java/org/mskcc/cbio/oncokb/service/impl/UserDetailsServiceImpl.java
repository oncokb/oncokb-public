package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.UserDetailsService;
import org.mskcc.cbio.oncokb.domain.UserDetails;
import org.mskcc.cbio.oncokb.repository.UserDetailsRepository;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;
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

    public UserDetailsServiceImpl(UserDetailsRepository userDetailsRepository, UserDetailsMapper userDetailsMapper) {
        this.userDetailsRepository = userDetailsRepository;
        this.userDetailsMapper = userDetailsMapper;
    }

    @Override
    public UserDetailsDTO save(UserDetailsDTO userDetailsDTO) {
        log.debug("Request to save UserDetails : {}", userDetailsDTO);
        UserDetails userDetails = userDetailsMapper.toEntity(userDetailsDTO);
        userDetails = userDetailsRepository.save(userDetails);
        return userDetailsMapper.toDto(userDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDetailsDTO> findAll() {
        log.debug("Request to get all UserDetails");
        return userDetailsRepository.findAll().stream()
            .map(userDetailsMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<UserDetailsDTO> findOne(Long id) {
        log.debug("Request to get UserDetails : {}", id);
        return userDetailsRepository.findById(id)
            .map(userDetailsMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete UserDetails : {}", id);
        userDetailsRepository.deleteById(id);
    }

    @Override
    public Optional<UserDetailsDTO> findOneByTrialActivationKey(String key) {
        return userDetailsRepository.findOneByTrialActivationKey(key)
            .map(userDetailsMapper::toDto);
    }
}
