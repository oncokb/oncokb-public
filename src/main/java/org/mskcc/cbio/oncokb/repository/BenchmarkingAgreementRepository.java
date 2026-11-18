package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.BenchmarkingAgreement;
import org.mskcc.cbio.oncokb.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BenchmarkingAgreementRepository extends JpaRepository<BenchmarkingAgreement, Long> {
    Optional<BenchmarkingAgreement> findOneByUser(User user);

    Optional<BenchmarkingAgreement> findOneByActivationKey(String activationKey);
}
