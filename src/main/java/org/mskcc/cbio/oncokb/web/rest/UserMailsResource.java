package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.service.UserMailsService;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;

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
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.UserMails}.
 */
@RestController
@RequestMapping("/api")
public class UserMailsResource {

    private final Logger log = LoggerFactory.getLogger(UserMailsResource.class);

    private static final String ENTITY_NAME = "userMails";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserMailsService userMailsService;

    public UserMailsResource(UserMailsService userMailsService) {
        this.userMailsService = userMailsService;
    }

    /**
     * {@code POST  /user-mails} : Create a new userMails.
     *
     * @param userMailsDTO the userMailsDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userMailsDTO, or with status {@code 400 (Bad Request)} if the userMails has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/user-mails")
    public ResponseEntity<UserMailsDTO> createUserMails(@Valid @RequestBody UserMailsDTO userMailsDTO) throws URISyntaxException {
        log.debug("REST request to save UserMails : {}", userMailsDTO);
        if (userMailsDTO.getId() != null) {
            throw new BadRequestAlertException("A new userMails cannot already have an ID", ENTITY_NAME, "idexists");
        }
        UserMailsDTO result = userMailsService.save(userMailsDTO);
        return ResponseEntity.created(new URI("/api/user-mails/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /user-mails} : Updates an existing userMails.
     *
     * @param userMailsDTO the userMailsDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userMailsDTO,
     * or with status {@code 400 (Bad Request)} if the userMailsDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userMailsDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/user-mails")
    public ResponseEntity<UserMailsDTO> updateUserMails(@Valid @RequestBody UserMailsDTO userMailsDTO) throws URISyntaxException {
        log.debug("REST request to update UserMails : {}", userMailsDTO);
        if (userMailsDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        UserMailsDTO result = userMailsService.save(userMailsDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, userMailsDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /user-mails} : get all the userMails.
     *

     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userMails in body.
     */
    @GetMapping("/user-mails")
    public List<UserMailsDTO> getAllUserMails() {
        log.debug("REST request to get all UserMails");
        return userMailsService.findAll();
    }

    /**
     * {@code GET  /user-mails/:id} : get the "id" userMails.
     *
     * @param id the id of the userMailsDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userMailsDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/user-mails/{id}")
    public ResponseEntity<UserMailsDTO> getUserMails(@PathVariable Long id) {
        log.debug("REST request to get UserMails : {}", id);
        Optional<UserMailsDTO> userMailsDTO = userMailsService.findOne(id);
        return ResponseUtil.wrapOrNotFound(userMailsDTO);
    }

    /**
     * {@code DELETE  /user-mails/:id} : delete the "id" userMails.
     *
     * @param id the id of the userMailsDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/user-mails/{id}")
    public ResponseEntity<Void> deleteUserMails(@PathVariable Long id) {
        log.debug("REST request to delete UserMails : {}", id);
        userMailsService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }
}
