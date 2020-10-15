package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.mskcc.cbio.oncokb.config.cache.TokenCacheResolver.TOKENS_BY_USER_LOGIN_CACHE;
import static org.mskcc.cbio.oncokb.config.cache.TokenCacheResolver.TOKEN_BY_UUID_CACHE;

/**
 * Service Implementation for managing {@link Token}.
 */
@Service
@Transactional
public class TokenServiceImpl implements TokenService {

    private final Logger log = LoggerFactory.getLogger(TokenServiceImpl.class);

    private final TokenRepository tokenRepository;

    private final CacheManager cacheManager;

    private final CacheNameResolver cacheNameResolver;


    public TokenServiceImpl(TokenRepository tokenRepository, CacheManager cacheManager, CacheNameResolver cacheNameResolver) {
        this.tokenRepository = tokenRepository;
        this.cacheManager = cacheManager;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Token save(Token token) {
        log.debug("Request to save Token : {}", token);

        Token updatedToken = tokenRepository.save(token);
        this.clearTokenCaches(token);
        return updatedToken;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Token> findAll() {
        log.debug("Request to get all Tokens");
        return tokenRepository.findAll();
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<Token> findOne(Long id) {
        log.debug("Request to get Token : {}", id);
        return tokenRepository.findById(id);
    }

    @Override
    public Optional<Token> findPublicWebsiteToken() {
        return tokenRepository.findPublicWebsiteToken();
    }

    @Override
    public Optional<Token> findByToken(UUID token) {
        return tokenRepository.findByToken(token);
    }

    @Override
    public List<Token> findByUserIsCurrentUser() {
        return tokenRepository.findByUserIsCurrentUser();
    }

    @Override
    public List<Token> findByUser(User user) {
        return tokenRepository.findByUserLogin(user.getLogin());
    }

    @Override
    public List<Token> findValidByUser(User user) {
        return tokenRepository.findByUserLogin(user.getLogin()).stream().filter(token -> token.getExpiration().isAfter(Instant.now())).collect(Collectors.toList());
    }

    @Override
    public void increaseTokenUsage(Long id, int increment) {
        tokenRepository.increaseTokenUsage(id, increment);
        Optional<Token> tokenOptional = tokenRepository.findById(id);
        if (tokenOptional.isPresent()) {
            this.clearTokenCaches(tokenOptional.get());
        }
    }

    @Override
    public List<Token> findAllExpiresBeforeDate(Instant date) {
        return tokenRepository.findAllExpiresBeforeDate(date);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Token : {}", id);
        tokenRepository.deleteById(id);
    }

    private void clearTokenCaches(Token token) {
        Objects.requireNonNull(cacheManager.getCache(this.cacheNameResolver.getCacheName(TOKEN_BY_UUID_CACHE))).evict(token.getToken());
        Objects.requireNonNull(cacheManager.getCache(this.cacheNameResolver.getCacheName(TOKENS_BY_USER_LOGIN_CACHE))).evict(token.getUser().getLogin());
    }
}
