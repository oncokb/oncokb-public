package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.Company;

import org.springframework.cache.annotation.Cacheable;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Company entity.
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    @Cacheable(cacheResolver = "companyCacheResolver")
    Optional<Company> findById(Long id);

    @Cacheable(cacheResolver = "companyCacheResolver")
    Optional<Company> findOneByNameIgnoreCase(String name);
}
