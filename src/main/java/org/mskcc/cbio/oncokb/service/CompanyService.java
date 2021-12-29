package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link org.mskcc.cbio.oncokb.domain.Company}.
 */
public interface CompanyService {

    /**
     * Save a new company
     * @param companyDTO the entity to save
     * @return the persisted entity
     */
    CompanyDTO createCompany(CompanyDTO companyDTO);

    /**
     * Update an existing company's information
     * @param companyDTO the entity to save
     * @return the persisted entity
     */
    CompanyDTO updateCompany(CompanyVM companyVm);

    boolean verifyLicenseStatusChange(LicenseStatus oldStatus, LicenseStatus newStatus);

    /**
     * Get all the companies.
     *
     * @return the list of entities.
     */
    List<CompanyDTO> findAll();


    /**
     * Get the "id" company.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<CompanyDTO> findOne(Long id);

    /**
     * Get the "name" company.
     *
     * @param name the name of the entity.
     * @return the entity.
     */
    Optional<CompanyDTO> findOneByNameIgnoreCase(String name);

    /**
     * Delete the "id" company.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}