package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.domain.TokenStats;
import org.mskcc.cbio.oncokb.service.TokenStatsService;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.TokenStats}.
 */
@RestController
@RequestMapping("/api")
public class TokenStatsResource {

    private final Logger log = LoggerFactory.getLogger(TokenStatsResource.class);

    private static final String ENTITY_NAME = "tokenStats";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TokenStatsService tokenStatsService;

    public TokenStatsResource(TokenStatsService tokenStatsService) {
        this.tokenStatsService = tokenStatsService;
    }

    /**
     * {@code POST  /token-stats} : Create a new tokenStats.
     *
     * @param tokenStats the tokenStats to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tokenStats, or with status {@code 400 (Bad Request)} if the tokenStats has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/token-stats")
    public ResponseEntity<TokenStats> createTokenStats(@RequestBody TokenStats tokenStats) throws URISyntaxException {
        log.debug("REST request to save TokenStats : {}", tokenStats);
        if (tokenStats.getId() != null) {
            throw new BadRequestAlertException("A new tokenStats cannot already have an ID", ENTITY_NAME, "idexists");
        }
        TokenStats result = tokenStatsService.save(tokenStats);
        return ResponseEntity.created(new URI("/api/token-stats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /token-stats} : Updates an existing tokenStats.
     *
     * @param tokenStats the tokenStats to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tokenStats,
     * or with status {@code 400 (Bad Request)} if the tokenStats is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tokenStats couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/token-stats")
    public ResponseEntity<TokenStats> updateTokenStats(@RequestBody TokenStats tokenStats) throws URISyntaxException {
        log.debug("REST request to update TokenStats : {}", tokenStats);
        if (tokenStats.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        TokenStats result = tokenStatsService.save(tokenStats);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, tokenStats.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /token-stats} : get all the tokenStats.
     *

     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tokenStats in body.
     */
    @GetMapping("/token-stats")
    public List<TokenStats> getAllTokenStats() {
        log.debug("REST request to get all TokenStats");
        return tokenStatsService.findAll();
    }

    /**
     * {@code GET  /token-stats/:id} : get the "id" tokenStats.
     *
     * @param id the id of the tokenStats to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tokenStats, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/token-stats/{id}")
    public ResponseEntity<TokenStats> getTokenStats(@PathVariable Long id) {
        log.debug("REST request to get TokenStats : {}", id);
        Optional<TokenStats> tokenStats = tokenStatsService.findOne(id);
        return ResponseUtil.wrapOrNotFound(tokenStats);
    }

    /**
     * {@code DELETE  /token-stats/:id} : delete the "id" tokenStats.
     *
     * @param id the id of the tokenStats to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/token-stats/{id}")
    public ResponseEntity<Void> deleteTokenStats(@PathVariable Long id) {
        log.debug("REST request to delete TokenStats : {}", id);
        tokenStatsService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }
}
