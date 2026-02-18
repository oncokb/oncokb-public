package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class TokenStatsAsyncService {

    private final Logger log = LoggerFactory.getLogger(TokenStatsAsyncService.class);

    private final TokenService tokenService;
    private final TokenStatsService tokenStatsService;
    private final ApplicationProperties applicationProperties;

    public TokenStatsAsyncService(TokenService tokenService, TokenStatsService tokenStatsService, ApplicationProperties applicationProperties) {
        this.tokenService = tokenService;
        this.tokenStatsService = tokenStatsService;
        this.applicationProperties = applicationProperties;
    }

    @Async("tokenStatsExecutor")
    public void saveTokenStats(UUID tokenUuid, String accessIp, String resource, int usageCount, Instant accessTime) {
        if (applicationProperties.getDbReadOnly()) {
            return;
        }
        Optional<Token> tokenOptional = tokenService.findByToken(tokenUuid);
        if (!tokenOptional.isPresent()) {
            return;
        }
        TokenStats tokenStats = new TokenStats();
        tokenStats.setToken(tokenOptional.get());
        tokenStats.setAccessIp(accessIp);
        tokenStats.setAccessTime(accessTime);
        tokenStats.setUsageCount(usageCount);
        tokenStats.setResource(resource);
        tokenStatsService.save(tokenStats);
    }
}
