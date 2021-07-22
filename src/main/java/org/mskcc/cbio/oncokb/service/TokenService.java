package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service Interface for managing {@link Token}.
 */
public interface TokenService {

    /**
     * Save a token.
     *
     * @param token the entity to save.
     * @return the persisted entity.
     */
    Token save(Token token);

    /**
     * Get all the tokens.
     *
     * @return the list of entities.
     */
    List<Token> findAll();


    /**
     * Get the "id" token.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<Token> findOne(Long id);

    Optional<Token> findPublicWebsiteToken();

    Optional<Token> findByToken(UUID token);

    List<Token> findByUserIsCurrentUser();

    List<Token> findByHasBeenUsed();

    List<Token> findByUser(User user);

    List<Token> findValidByUser(User user);

    /**
     *
     * @param id the id of the entity
     * @param increment the increment the token usage will add
     */
    void increaseTokenUsage(Long id, int increment);

    List<Token> findAllExpiresBeforeDate(Instant date);
    /**
     * Delete the "id" token.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
