package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.TokenStats;

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
     */
    List<TokenStats> findAll();

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

    void removeOldTokenStats();
}
