package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing {@link Token}.
 */
@Service
@Transactional
public class TokenServiceImpl implements TokenService {

    private final Logger log = LoggerFactory.getLogger(TokenServiceImpl.class);

    private final TokenRepository tokenRepository;

    public TokenServiceImpl(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    /**
     * Save a token.
     *
     * @param token the entity to save.
     * @return the persisted entity.
     */
    @Override
    public Token save(Token token) {
        log.debug("Request to save Token : {}", token);
        return tokenRepository.save(token);
    }

    /**
     * Get all the tokens.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Token> findAll() {
        log.debug("Request to get all Tokens");
        return tokenRepository.findAll();
    }


    /**
     * Get one token by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Token> findOne(Long id) {
        log.debug("Request to get Token : {}", id);
        return tokenRepository.findById(id);
    }


    @Override
    public Optional<Token> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    @Override
    public List<Token> findByUserIsCurrentUser() {
        return tokenRepository.findByUserIsCurrentUser().stream().filter(token -> token.getExpiration().isAfter(LocalDate.now())).collect(Collectors.toList());
    }

    @Override
    public List<Token> findByUser(User user) {
        return tokenRepository.findByUser(user).stream().filter(token -> token.getExpiration().isAfter(LocalDate.now())).collect(Collectors.toList());
    }

    /**
     * Delete the token by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Token : {}", id);
        tokenRepository.deleteById(id);
    }
}
