package org.mskcc.cbio.oncokb.repository;

import java.util.Optional;

import org.mskcc.cbio.oncokb.domain.CompanyDomain;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the CompanyDomain entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CompanyDomainRepository extends JpaRepository<CompanyDomain, Long> {

    Optional<CompanyDomain> findOneByNameIgnoreCase(String name);
}
