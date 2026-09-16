package org.mskcc.cbio.oncokb.service.impl;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.cbio.oncokb.domain.SuspiciousEmailDomain;
import org.mskcc.cbio.oncokb.repository.SuspiciousEmailDomainRepository;
import org.mskcc.cbio.oncokb.service.SuspiciousEmailDomainService;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainDTO;
import org.mskcc.cbio.oncokb.service.mapper.SuspiciousEmailDomainMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SuspiciousEmailDomainServiceImpl implements SuspiciousEmailDomainService {

    private final Logger log = LoggerFactory.getLogger(SuspiciousEmailDomainServiceImpl.class);

    private final SuspiciousEmailDomainRepository suspiciousEmailDomainRepository;

    private final SuspiciousEmailDomainMapper suspiciousEmailDomainMapper;

    public SuspiciousEmailDomainServiceImpl(
        SuspiciousEmailDomainRepository suspiciousEmailDomainRepository,
        SuspiciousEmailDomainMapper suspiciousEmailDomainMapper
    ) {
        this.suspiciousEmailDomainRepository = suspiciousEmailDomainRepository;
        this.suspiciousEmailDomainMapper = suspiciousEmailDomainMapper;
    }

    @Override
    public SuspiciousEmailDomainDTO save(SuspiciousEmailDomainDTO suspiciousEmailDomainDTO) {
        log.debug("Request to save SuspiciousEmailDomain : {}", suspiciousEmailDomainDTO);
        SuspiciousEmailDomain suspiciousEmailDomain = suspiciousEmailDomainMapper.toEntity(suspiciousEmailDomainDTO);
        suspiciousEmailDomain = suspiciousEmailDomainRepository.save(suspiciousEmailDomain);
        return suspiciousEmailDomainMapper.toDto(suspiciousEmailDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuspiciousEmailDomainDTO> findAll() {
        log.debug("Request to get all SuspiciousEmailDomains");
        return suspiciousEmailDomainRepository.findAll().stream()
            .map(suspiciousEmailDomainMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuspiciousEmailDomainDTO> findOne(Long id) {
        log.debug("Request to get SuspiciousEmailDomain : {}", id);
        return suspiciousEmailDomainRepository.findById(id)
            .map(suspiciousEmailDomainMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuspiciousEmailDomainDTO> findOneByDomain(String domain) {
        log.debug("Request to get SuspiciousEmailDomain by domain: {}", domain);
        return suspiciousEmailDomainRepository.findOneByDomainIgnoreCase(domain)
            .map(suspiciousEmailDomainMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete SuspiciousEmailDomain : {}", id);
        suspiciousEmailDomainRepository.deleteById(id);
    }
}
