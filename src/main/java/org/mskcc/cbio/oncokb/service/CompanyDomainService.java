package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link org.mskcc.cbio.oncokb.domain.CompanyDomain}.
 */
public interface CompanyDomainService {

    /**
     * Save a companyDomain.
     *
     * @param companyDomainDTO the entity to save.
     * @return the persisted entity.
     */
    CompanyDomainDTO save(CompanyDomainDTO companyDomainDTO);

    /**
     * Get all the companyDomains.
     *
     * @return the list of entities.
     */
    List<CompanyDomainDTO> findAll();


    /**
     * Get the "id" companyDomain.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<CompanyDomainDTO> findOne(Long id);

    /**
     * Delete the "id" companyDomain.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
