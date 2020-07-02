package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.TokenStats;

import org.mskcc.cbio.oncokb.querydomain.UserTokenUsage;
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

    @Query("select sum(tokenStats.usageCount) as count, tokenStats.token as token from TokenStats tokenStats group by tokenStats.token")
    List<UserTokenUsage> countTokenUsageByToken();
}
