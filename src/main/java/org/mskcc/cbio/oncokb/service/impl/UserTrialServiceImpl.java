package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserTrial;
import org.mskcc.cbio.oncokb.repository.UserTrialRepository;
import org.mskcc.cbio.oncokb.service.UserTrialService;
import org.mskcc.cbio.oncokb.service.dto.UserTrialDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserTrialMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserTrialServiceImpl implements UserTrialService {

    private final Logger log = LoggerFactory.getLogger(UserTrialServiceImpl.class);

    private final UserTrialRepository userTrialRepository;

    private final UserTrialMapper userTrialMapper;

    public UserTrialServiceImpl(UserTrialRepository userTrialRepository, UserTrialMapper userTrialMapper) {
        this.userTrialRepository = userTrialRepository;
        this.userTrialMapper = userTrialMapper;
    }

    @Override
    public UserTrialDTO save(UserTrialDTO userTrialDTO) {
        log.debug("Request to save UserTrial : {}", userTrialDTO);
        UserTrial userTrial = userTrialMapper.toEntity(userTrialDTO);
        userTrial = userTrialRepository.save(userTrial);
        return userTrialMapper.toDto(userTrial);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserTrialDTO> findOneByUser(User user) {
        return userTrialRepository.findOneByUser(user).map(userTrialMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserTrialDTO> findOneByActivationKey(String activationKey) {
        return userTrialRepository.findOneByActivationKey(activationKey).map(userTrialMapper::toDto);
    }

    @Override
    public void deleteByUser(User user) {
        userTrialRepository.deleteByUser(user);
    }
}
