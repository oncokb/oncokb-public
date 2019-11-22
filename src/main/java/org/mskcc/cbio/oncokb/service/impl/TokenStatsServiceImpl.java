package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.TokenStatsService;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.repository.TokenStatsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service Implementation for managing {@link TokenStats}.
 */
@Service
@Transactional
public class TokenStatsServiceImpl implements TokenStatsService {

    private final Logger log = LoggerFactory.getLogger(TokenStatsServiceImpl.class);

    private final TokenStatsRepository tokenStatsRepository;

    public TokenStatsServiceImpl(TokenStatsRepository tokenStatsRepository) {
        this.tokenStatsRepository = tokenStatsRepository;
    }

    /**
     * Save a tokenStats.
     *
     * @param tokenStats the entity to save.
     * @return the persisted entity.
     */
    @Override
    public TokenStats save(TokenStats tokenStats) {
        log.debug("Request to save TokenStats : {}", tokenStats);
        return tokenStatsRepository.save(tokenStats);
    }

    /**
     * Get all the tokenStats.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TokenStats> findAll() {
        log.debug("Request to get all TokenStats");
        return tokenStatsRepository.findAll();
    }


    /**
     * Get one tokenStats by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<TokenStats> findOne(Long id) {
        log.debug("Request to get TokenStats : {}", id);
        return tokenStatsRepository.findById(id);
    }

    /**
     * Delete the tokenStats by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete TokenStats : {}", id);
        tokenStatsRepository.deleteById(id);
    }
}
