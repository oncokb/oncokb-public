package org.mskcc.cbio.oncokb.repository;

import java.util.Optional;

import org.mskcc.cbio.oncokb.domain.Company;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data  repository for the Company entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findOneByNameIgnoreCase(String name);
}