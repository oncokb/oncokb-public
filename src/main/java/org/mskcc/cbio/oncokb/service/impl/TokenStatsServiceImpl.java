package org.mskcc.cbio.oncokb.service.impl;

import io.github.jhipster.config.JHipsterProperties;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsage;
import org.mskcc.cbio.oncokb.querydomain.UserTokenUsageWithInfo;
import org.mskcc.cbio.oncokb.service.TokenStatsService;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.repository.TokenStatsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    private final JHipsterProperties jHipsterProperties;

    public TokenStatsServiceImpl(TokenStatsRepository tokenStatsRepository, JHipsterProperties jHipsterProperties) {
        this.tokenStatsRepository = tokenStatsRepository;
        this.jHipsterProperties = jHipsterProperties;
    }

    @Override
    public TokenStats save(TokenStats tokenStats) {
        log.debug("Request to save TokenStats : {}", tokenStats);
        return tokenStatsRepository.save(tokenStats);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TokenStats> findAll() {
        log.debug("Request to get all TokenStats");
        return tokenStatsRepository.findAll();
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<TokenStats> findOne(Long id) {
        log.debug("Request to get TokenStats : {}", id);
        return tokenStatsRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete TokenStats : {}", id);
        tokenStatsRepository.deleteById(id);
    }

    public void clearTokenStats(Instant before) {
        tokenStatsRepository.deleteAllByAccessTimeBefore(before);
    }

    /**
     * Old audit events should be automatically deleted after 30 days.
     *
     */
    public void removeOldTokenStats() {
        tokenStatsRepository
            .findByAccessTimeBefore(Instant.now().minus(jHipsterProperties.getAuditEvents().getRetentionPeriod(), ChronoUnit.DAYS))
            .forEach(tokenStat -> {
                log.debug("Deleting token stats", tokenStat);
                tokenStatsRepository.delete(tokenStat);
            });
    }

    public List<UserTokenUsage> getUserTokenUsage(Instant before) {
        return tokenStatsRepository.countTokenUsageByToken(before);
    }

    public List<UserTokenUsageWithInfo> getTokenUsageAnalysis(Instant after) {
        return tokenStatsRepository.countTokenUsageByTokenTimeResource(after);
    }
}
