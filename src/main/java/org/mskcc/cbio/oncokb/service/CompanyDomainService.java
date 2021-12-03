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
     * Check if the domain belongs another regular tiered company.
     * @param names the domain names
     * @param companyId the company we are verifying the domains or null if verifying for new company
     * @return list of domains that are in conflict
     */
    List<CompanyDomainDTO> verifyCompanyDomains(List<String> names, Long companyId);

    /**
     * Delete the "id" companyDomain.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
