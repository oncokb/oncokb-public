package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.service.TokenService;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.Token}.
 */
//@RestController
//@RequestMapping("/api")
public class TokenResource {

    private final Logger log = LoggerFactory.getLogger(TokenResource.class);

    private static final String ENTITY_NAME = "token";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TokenService tokenService;

    public TokenResource(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    /**
     * {@code POST  /tokens} : Create a new token.
     *
     * @param token the token to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new token, or with status {@code 400 (Bad Request)} if the token has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/tokens")
    public ResponseEntity<Token> createToken(@Valid @RequestBody Token token) throws URISyntaxException {
        log.debug("REST request to save Token : {}", token);
        if (token.getId() != null) {
            throw new BadRequestAlertException("A new token cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Token result = tokenService.save(token);
        return ResponseEntity.created(new URI("/api/tokens/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /tokens} : Updates an existing token.
     *
     * @param token the token to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated token,
     * or with status {@code 400 (Bad Request)} if the token is not valid,
     * or with status {@code 500 (Internal Server Error)} if the token couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/tokens")
    public ResponseEntity<Token> updateToken(@Valid @RequestBody Token token) throws URISyntaxException {
        log.debug("REST request to update Token : {}", token);
        if (token.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Token result = tokenService.save(token);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, token.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /tokens} : get all the tokens.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tokens in body.
     */
    @GetMapping("/tokens")
    public List<Token> getAllTokens() {
        log.debug("REST request to get all Tokens");
        return tokenService.findAll();
    }

    /**
     * {@code GET  /tokens/:id} : get the "id" token.
     *
     * @param id the id of the token to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the token, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/tokens/{id}")
    public ResponseEntity<Token> getToken(@PathVariable Long id) {
        log.debug("REST request to get Token : {}", id);
        Optional<Token> token = tokenService.findOne(id);
        return ResponseUtil.wrapOrNotFound(token);
    }

    /**
     * {@code DELETE  /tokens/:id} : delete the "id" token.
     *
     * @param id the id of the token to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/tokens/{id}")
    public ResponseEntity<Void> deleteToken(@PathVariable Long id) {
        log.debug("REST request to delete Token : {}", id);
        tokenService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }
}
