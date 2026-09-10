package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.service.dto.UserTrialDTO;

import java.util.Optional;

public interface UserTrialService {
    UserTrialDTO save(UserTrialDTO userTrialDTO);

    Optional<UserTrialDTO> findOneByUser(User user);

    Optional<UserTrialDTO> findOneByActivationKey(String activationKey);

    void deleteByUser(User user);
}
