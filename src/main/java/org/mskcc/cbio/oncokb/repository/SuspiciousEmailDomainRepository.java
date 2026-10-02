package org.mskcc.cbio.oncokb.repository;

import java.util.Optional;
import org.mskcc.cbio.oncokb.domain.SuspiciousEmailDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuspiciousEmailDomainRepository extends JpaRepository<SuspiciousEmailDomain, Long> {
    Optional<SuspiciousEmailDomain> findOneByDomainIgnoreCase(String domain);
}
