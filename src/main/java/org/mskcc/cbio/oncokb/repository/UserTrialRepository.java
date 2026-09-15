package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserTrial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserTrialRepository extends JpaRepository<UserTrial, Long> {
    Optional<UserTrial> findOneByUser(User user);

    Optional<UserTrial> findOneByUserId(Long userId);

    Optional<UserTrial> findOneByActivationKey(String activationKey);

    List<UserTrial> findByUserIdIn(List<Long> userIds);

    void deleteByUser(User user);
}
