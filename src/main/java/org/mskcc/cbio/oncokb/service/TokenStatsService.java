package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsage;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsageWithInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link TokenStats}.
 */
public interface TokenStatsService {

    /**
     * Save a tokenStats.
     *
     * @param tokenStats the entity to save.
     * @return the persisted entity.
     */
    TokenStats save(TokenStats tokenStats);

    /**
     * Get all the tokenStats.
     *
     * @return the list of entities.
     * @param before
     */
    Page<TokenStats> findAll(Instant before, Pageable pageable);


    /**
     * Get the "id" tokenStats.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<TokenStats> findOne(Long id);

    /**
     * Delete the "id" tokenStats.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    void clearTokenStats(Instant before);

    List<UserTokenUsage> getUserTokenUsage(Instant before);

    List<UserTokenUsageWithInfo> getTokenUsageAnalysis(Instant after);

    List<TokenStats> getAllTokenStatsByTokenId(Long tokenId);
}
