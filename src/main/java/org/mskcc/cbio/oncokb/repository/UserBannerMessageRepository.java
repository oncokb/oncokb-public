package org.mskcc.cbio.oncokb.repository;

import java.time.LocalDate;
import java.util.List;
import org.mskcc.cbio.oncokb.domain.UserBannerMessage;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the CompanyDomain entity.
 */
@Repository
public interface UserBannerMessageRepository
  extends JpaRepository<UserBannerMessage, Long> {
  @Query(
    "select userBannerMessage from UserBannerMessage userBannerMessage " +
    "where (:today is null or userBannerMessage.startDate is null or userBannerMessage.startDate <= :today) " +
    "and (:today is null or userBannerMessage.endDate is null or userBannerMessage.endDate >= :today)"
  )
  List<UserBannerMessage> findActiveBannerMessages(@Param("today") LocalDate today);
}
