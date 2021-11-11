package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the UserDetails entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserDetailsRepository extends JpaRepository<UserDetails, Long> {

    Optional<UserDetails> findOneByUser(User user);

    @Query("select ud from UserDetails ud where ud.additionalInfo like %?1%")
    Optional<UserDetails> findOneByTrialActivationKey(String key);

    List<UserDetails> findByCompanyId(Long companyId);
}
