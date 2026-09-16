package org.mskcc.cbio.oncokb.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainDTO;

public interface SuspiciousEmailDomainService {

    SuspiciousEmailDomainDTO save(SuspiciousEmailDomainDTO suspiciousEmailDomainDTO);

    List<SuspiciousEmailDomainDTO> findAll();

    Optional<SuspiciousEmailDomainDTO> findOne(Long id);

    Optional<SuspiciousEmailDomainDTO> findOneByDomain(String domain);

    void delete(Long id);
}
