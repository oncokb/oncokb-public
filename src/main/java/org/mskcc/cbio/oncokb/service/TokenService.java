package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

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

    Optional<Token> findByToken(String token);

    List<Token> findByUserIsCurrentUser();
    /**
     * Delete the "id" token.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
