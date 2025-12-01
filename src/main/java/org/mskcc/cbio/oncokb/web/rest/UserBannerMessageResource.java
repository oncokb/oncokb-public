package org.mskcc.cbio.oncokb.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import javax.validation.Valid;
import org.mskcc.cbio.oncokb.service.UserBannerMessageService;
import org.mskcc.cbio.oncokb.service.dto.UserBannerMessageDTO;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing
 * {@link org.mskcc.cbio.oncokb.domain.UserBannerMessage}.
 */
@RestController
@RequestMapping("/api")
public class UserBannerMessageResource {
    private final Logger log = LoggerFactory.getLogger(
            UserBannerMessageResource.class);

    private static final String ENTITY_NAME = "userBannerMessage";

    private final UserBannerMessageService userBannerMessageService;

    public UserBannerMessageResource(
            UserBannerMessageService userBannerMessageService) {
        this.userBannerMessageService = userBannerMessageService;
    }

    /**
     * {@code POST  /user-banner-messages} : Create a new userBannerMessage.
     *
     * @param userBannerMessageDTO the userBannerMessageDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new userBannerMessageDTO,
     *         or with status {@code 400 (Bad Request)} if the userBannerMessage
     *         already has an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/user-banner-messages")
    public ResponseEntity<UserBannerMessageDTO> createUserBannerMessage(
            @Valid @RequestBody UserBannerMessageDTO userBannerMessageDTO)
            throws URISyntaxException {
        log.debug(
                "REST request to save UserBannerMessage : {}",
                userBannerMessageDTO);
        if (userBannerMessageDTO.getId() != null) {
            throw new BadRequestAlertException(
                    "A new userBannerMessage cannot already have an ID",
                    ENTITY_NAME,
                    "idexists");
        }
        UserBannerMessageDTO result = userBannerMessageService.save(
                userBannerMessageDTO);
        return ResponseEntity
                .created(new URI("/api/user-banner-messages/" + result.getId()))
                .body(result);
    }

    /**
     * {@code PUT  /user-banner-messages} : Updates an existing userBannerMessage.
     *
     * @param userBannerMessageDTO the userBannerMessageDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated userBannerMessageDTO,
     *         or with status {@code 400 (Bad Request)} if the userBannerMessageDTO
     *         is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         userBannerMessageDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/user-banner-messages")
    public ResponseEntity<UserBannerMessageDTO> updateUserBannerMessage(
            @Valid @RequestBody UserBannerMessageDTO userBannerMessageDTO)
            throws URISyntaxException {
        log.debug(
                "REST request to update UserBannerMessage : {}",
                userBannerMessageDTO);
        if (userBannerMessageDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        UserBannerMessageDTO result = userBannerMessageService.save(
                userBannerMessageDTO);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code GET  /user-banner-messages} : get all the userBannerMessages.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of userBannerMessages in body.
     */
    @GetMapping("/user-banner-messages")
    public List<UserBannerMessageDTO> getAllUserBannerMessages() {
        log.debug("REST request to get all UserBannerMessages");
        return userBannerMessageService.findAll();
    }

    /**
     * {@code GET  /user-banner-messages/active} : get banner messages that are
     * active today.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of active userBannerMessages in body.
     */
    @GetMapping("/user-banner-messages/active")
    public List<UserBannerMessageDTO> getActiveUserBannerMessages() {
        log.debug("REST request to get active UserBannerMessages");
        return userBannerMessageService.findAllActive();
    }

    /**
     * {@code GET  /user-banner-messages/:id} : get the "id" userBannerMessage.
     *
     * @param id the id of the userBannerMessageDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the userBannerMessageDTO,
     *         or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/user-banner-messages/{id}")
    public ResponseEntity<UserBannerMessageDTO> getUserBannerMessage(
            @PathVariable Long id) {
        log.debug("REST request to get UserBannerMessage : {}", id);
        Optional<UserBannerMessageDTO> userBannerMessageDTO = userBannerMessageService.findOne(
                id);
        return ResponseUtil.wrapOrNotFound(userBannerMessageDTO);
    }

    /**
     * {@code DELETE  /user-banner-messages/:id} : delete the "id"
     * userBannerMessage.
     *
     * @param id the id of the userBannerMessageDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @DeleteMapping("/user-banner-messages/{id}")
    public ResponseEntity<Void> deleteUserBannerMessage(@PathVariable Long id) {
        log.debug("REST request to delete UserBannerMessage : {}", id);
        userBannerMessageService.delete(id);
        return ResponseEntity.ok().build();
    }
}
