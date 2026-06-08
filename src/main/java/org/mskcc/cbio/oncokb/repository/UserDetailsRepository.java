package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserDetails;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.cbio.oncokb.repository.projection.UserRegistrationSummaryProjection;


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

    List<UserDetails> findByCompanyIdIsNull();

    @Query("select ud from UserDetails ud where ud.user.login = ?#{principal.username}")
    Optional<UserDetails> findByUserIsCurrentUser();

    void deleteByUser(User user);

    @Query("select ud.user.email from UserDetails ud where ud.company.id is null")
    List<String> findUserEmailsByCompanyIdIsNull();

    // Intentionally leave sorting to the client for the admin registrations table.
    // If server-side paging is introduced later, add ORDER BY here to match the requested sort.
    @Query(
        value = "SELECT DATE(ju.created_date) AS date, COUNT(*) AS total, ud.license_type AS licenseType " +
            "FROM jhi_user ju " +
            "INNER JOIN user_details ud ON ju.id = ud.user_id " +
            "WHERE ud.license_type IS NOT NULL " +
            "GROUP BY DATE(ju.created_date), ud.license_type",
        nativeQuery = true
    )
    List<UserRegistrationSummaryProjection> findDailyRegistrationSummaries();
}
