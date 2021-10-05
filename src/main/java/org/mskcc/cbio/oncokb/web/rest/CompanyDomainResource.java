package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.CompanyDomain}.
 */
@RestController
@RequestMapping("/api")
public class CompanyDomainResource {

    private final Logger log = LoggerFactory.getLogger(CompanyDomainResource.class);

    private static final String ENTITY_NAME = "companyDomain";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CompanyDomainService companyDomainService;

    public CompanyDomainResource(CompanyDomainService companyDomainService) {
        this.companyDomainService = companyDomainService;
    }

    /**
     * {@code POST  /company-domains} : Create a new companyDomain.
     *
     * @param companyDomainDTO the companyDomainDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new companyDomainDTO, or with status {@code 400 (Bad Request)} if the companyDomain has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/company-domains")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<CompanyDomainDTO> createCompanyDomain(@Valid @RequestBody CompanyDomainDTO companyDomainDTO) throws URISyntaxException {
        log.debug("REST request to save CompanyDomain : {}", companyDomainDTO);
        if (companyDomainDTO.getId() != null) {
            throw new BadRequestAlertException("A new companyDomain cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CompanyDomainDTO result = companyDomainService.save(companyDomainDTO);
        return ResponseEntity.created(new URI("/api/company-domains/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /company-domains} : Updates an existing companyDomain.
     *
     * @param companyDomainDTO the companyDomainDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated companyDomainDTO,
     * or with status {@code 400 (Bad Request)} if the companyDomainDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the companyDomainDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/company-domains")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<CompanyDomainDTO> updateCompanyDomain(@Valid @RequestBody CompanyDomainDTO companyDomainDTO) throws URISyntaxException {
        log.debug("REST request to update CompanyDomain : {}", companyDomainDTO);
        if (companyDomainDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        CompanyDomainDTO result = companyDomainService.save(companyDomainDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, companyDomainDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /company-domains} : get all the companyDomains.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of companyDomains in body.
     */
    @GetMapping("/company-domains")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public List<CompanyDomainDTO> getAllCompanyDomains() {
        log.debug("REST request to get all CompanyDomains");
        return companyDomainService.findAll();
    }

    /**
     * {@code GET  /company-domains/:id} : get the "id" companyDomain.
     *
     * @param id the id of the companyDomainDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the companyDomainDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/company-domains/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<CompanyDomainDTO> getCompanyDomain(@PathVariable Long id) {
        log.debug("REST request to get CompanyDomain : {}", id);
        Optional<CompanyDomainDTO> companyDomainDTO = companyDomainService.findOne(id);
        return ResponseUtil.wrapOrNotFound(companyDomainDTO);
    }

    /**
     * {@code DELETE  /company-domains/:id} : delete the "id" companyDomain.
     *
     * @param id the id of the companyDomainDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/company-domains/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deleteCompanyDomain(@PathVariable Long id) {
        log.debug("REST request to delete CompanyDomain : {}", id);
        companyDomainService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }
}
