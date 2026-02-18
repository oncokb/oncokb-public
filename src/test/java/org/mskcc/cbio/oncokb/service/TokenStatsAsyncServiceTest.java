package org.mskcc.cbio.oncokb.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenStatsAsyncServiceTest {

    @Mock
    private TokenService tokenService;

    @Mock
    private TokenStatsService tokenStatsService;

    @Captor
    private ArgumentCaptor<TokenStats> tokenStatsCaptor;

    @Test
    void saveTokenStats_skipsWhenDbReadOnly() {
        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setDbReadOnly(true);
        TokenStatsAsyncService service = new TokenStatsAsyncService(tokenService, tokenStatsService, applicationProperties);

        service.saveTokenStats(UUID.randomUUID(), "1.2.3.4", "GET /api/test", 1, Instant.now());

        verifyNoInteractions(tokenService);
        verifyNoInteractions(tokenStatsService);
    }

    @Test
    void saveTokenStats_skipsWhenTokenNotFound() {
        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setDbReadOnly(false);
        TokenStatsAsyncService service = new TokenStatsAsyncService(tokenService, tokenStatsService, applicationProperties);
        UUID tokenId = UUID.randomUUID();

        when(tokenService.findByToken(tokenId)).thenReturn(Optional.empty());

        service.saveTokenStats(tokenId, "1.2.3.4", "GET /api/test", 1, Instant.now());

        verify(tokenService).findByToken(tokenId);
        verifyNoInteractions(tokenStatsService);
    }

    @Test
    void saveTokenStats_savesExpectedFields() {
        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setDbReadOnly(false);
        TokenStatsAsyncService service = new TokenStatsAsyncService(tokenService, tokenStatsService, applicationProperties);
        UUID tokenId = UUID.randomUUID();
        Token token = new Token().token(tokenId);
        Instant accessTime = Instant.now();

        when(tokenService.findByToken(tokenId)).thenReturn(Optional.of(token));

        service.saveTokenStats(tokenId, "1.2.3.4", "GET /api/test", 3, accessTime);

        verify(tokenStatsService).save(tokenStatsCaptor.capture());
        TokenStats saved = tokenStatsCaptor.getValue();
        assertThat(saved.getToken()).isSameAs(token);
        assertThat(saved.getAccessIp()).isEqualTo("1.2.3.4");
        assertThat(saved.getResource()).isEqualTo("GET /api/test");
        assertThat(saved.getUsageCount()).isEqualTo(3);
        assertThat(saved.getAccessTime()).isEqualTo(accessTime);
    }
}
