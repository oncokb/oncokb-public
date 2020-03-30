package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.UserMailsService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;

import io.github.jhipster.web.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import javax.security.auth.login.AccountNotFoundException;
import java.util.List;

/**
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.UserMails}.
 */
@RestController
@RequestMapping("/api")
@PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
public class UserMailsResource {

    private final Logger log = LoggerFactory.getLogger(UserMailsResource.class);

    private static final String ENTITY_NAME = "userMails";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserMailsService userMailsService;

    private final UserService userService;


    public UserMailsResource(UserMailsService userMailsService, UserService userService) {
        this.userMailsService = userMailsService;
        this.userService = userService;
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
     * {@code GET  /user-mails/users/:login} : get the userMails for "login".
     *
     * @param login the login of the user.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userMailsDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/user-mails/users/{login:" + Constants.LOGIN_REGEX + "}")
    public List<UserMailsDTO> getUsersUserMails(@PathVariable String login) throws AccountNotFoundException {
        log.debug("REST request to get all user mails realated to login : {}", login);
        userService.getUserWithAuthoritiesByLogin(login).orElseThrow(()->new AccountNotFoundException());
        return userMailsService.findUserAll(login);
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
