package org.mskcc.cbio.oncokb.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import javax.validation.Valid;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.service.SuspiciousEmailDomainService;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainCreateDTO;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainDTO;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SuspiciousEmailDomainResource {

    private final Logger log = LoggerFactory.getLogger(SuspiciousEmailDomainResource.class);

    private static final String ENTITY_NAME = "suspiciousEmailDomain";

    private final SuspiciousEmailDomainService suspiciousEmailDomainService;

    public SuspiciousEmailDomainResource(SuspiciousEmailDomainService suspiciousEmailDomainService) {
        this.suspiciousEmailDomainService = suspiciousEmailDomainService;
    }

    @PostMapping("/suspicious-email-domains")
    public ResponseEntity<SuspiciousEmailDomainDTO> createSuspiciousEmailDomain(
        @Valid @RequestBody SuspiciousEmailDomainCreateDTO suspiciousEmailDomainDTO
    ) throws URISyntaxException {
        log.debug("REST request to save SuspiciousEmailDomain : {}", suspiciousEmailDomainDTO);

        validateUniqueDomain(suspiciousEmailDomainDTO.getDomain(), null);
        SuspiciousEmailDomainDTO result = suspiciousEmailDomainService.save(normalizeDomain(suspiciousEmailDomainDTO));
        return ResponseEntity.created(new URI("/api/suspicious-email-domains/" + result.getId())).body(result);
    }

    @PutMapping("/suspicious-email-domains")
    public ResponseEntity<SuspiciousEmailDomainDTO> updateSuspiciousEmailDomain(
        @Valid @RequestBody SuspiciousEmailDomainDTO suspiciousEmailDomainDTO
    ) {
        log.debug("REST request to update SuspiciousEmailDomain : {}", suspiciousEmailDomainDTO);
        if (suspiciousEmailDomainDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        validateUniqueDomain(suspiciousEmailDomainDTO.getDomain(), suspiciousEmailDomainDTO.getId());
        SuspiciousEmailDomainDTO result = suspiciousEmailDomainService.save(normalizeDomain(suspiciousEmailDomainDTO));
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/suspicious-email-domains")
    public List<SuspiciousEmailDomainDTO> getAllSuspiciousEmailDomains() {
        log.debug("REST request to get all SuspiciousEmailDomains");
        return suspiciousEmailDomainService.findAll();
    }

    @GetMapping("/suspicious-email-domains/{id}")
    public ResponseEntity<SuspiciousEmailDomainDTO> getSuspiciousEmailDomain(@PathVariable Long id) {
        log.debug("REST request to get SuspiciousEmailDomain : {}", id);
        Optional<SuspiciousEmailDomainDTO> suspiciousEmailDomainDTO = suspiciousEmailDomainService.findOne(id);
        return ResponseUtil.wrapOrNotFound(suspiciousEmailDomainDTO);
    }

    @DeleteMapping("/suspicious-email-domains/{id}")
    public ResponseEntity<Void> deleteSuspiciousEmailDomain(@PathVariable Long id) {
        log.debug("REST request to delete SuspiciousEmailDomain : {}", id);
        suspiciousEmailDomainService.delete(id);
        return ResponseEntity.ok().build();
    }

    private SuspiciousEmailDomainDTO normalizeDomain(SuspiciousEmailDomainDTO dto) {
        dto.setDomain(StringUtils.trimToEmpty(dto.getDomain()).toLowerCase());
        dto.setJustification(StringUtils.trimToEmpty(dto.getJustification()));
        return dto;
    }

    private SuspiciousEmailDomainDTO normalizeDomain(SuspiciousEmailDomainCreateDTO dto) {
        SuspiciousEmailDomainDTO suspiciousEmailDomainDTO = new SuspiciousEmailDomainDTO();
        suspiciousEmailDomainDTO.setDomain(StringUtils.trimToEmpty(dto.getDomain()).toLowerCase());
        suspiciousEmailDomainDTO.setJustification(StringUtils.trimToEmpty(dto.getJustification()));
        return suspiciousEmailDomainDTO;
    }

    private void validateUniqueDomain(String domain, Long currentId) {
        Optional<SuspiciousEmailDomainDTO> existing = suspiciousEmailDomainService.findOneByDomain(StringUtils.trimToEmpty(domain));
        if (existing.isPresent() && !existing.get().getId().equals(currentId)) {
            throw new BadRequestAlertException("Domain already exists", ENTITY_NAME, "domainexists");
        }
    }
}
