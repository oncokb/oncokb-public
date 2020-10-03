package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.TokenStats;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the TokenStats entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TokenStatsRepository extends JpaRepository<TokenStats, Long> {
}
