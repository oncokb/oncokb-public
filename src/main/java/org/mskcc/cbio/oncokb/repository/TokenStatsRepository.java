package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.TokenStats;

import org.mskcc.cbio.oncokb.querydomain.UserTokenUsage;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsageWithInfo;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data  repository for the TokenStats entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TokenStatsRepository extends JpaRepository<TokenStats, Long> {
    List<TokenStats> findByAccessTimeBefore(Instant before);

    @Query("select sum(tokenStats.usageCount) as count, tokenStats.token as token from TokenStats tokenStats where tokenStats.accessTime < ?1 group by tokenStats.token")
    List<UserTokenUsage> countTokenUsageByToken(Instant before);

    @Query(value = "select sum(tokenStats.usageCount) as count, tokenStats.token as token, DATE_FORMAT(tokenStats.accessTime,'%Y-%m') as time, tokenStats.resource as resource " +
    " from TokenStats tokenStats " +
    " where tokenStats.accessTime > ?1 " +
    " group by tokenStats.token, DATE_FORMAT(tokenStats.accessTime,'%Y-%m'), tokenStats.resource", nativeQuery = true)
    List<UserTokenUsageWithInfo> countTokenUsageByTokenTimeResource(Instant after);
}
