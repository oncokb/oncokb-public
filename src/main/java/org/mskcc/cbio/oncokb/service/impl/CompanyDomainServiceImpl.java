package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.domain.CompanyDomain;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyDomainMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing {@link CompanyDomain}.
 */
@Service
@Transactional
public class CompanyDomainServiceImpl implements CompanyDomainService {

    private final Logger log = LoggerFactory.getLogger(CompanyDomainServiceImpl.class);

    private final CompanyDomainRepository companyDomainRepository;

    private final CompanyDomainMapper companyDomainMapper;

    public CompanyDomainServiceImpl(CompanyDomainRepository companyDomainRepository, CompanyDomainMapper companyDomainMapper) {
        this.companyDomainRepository = companyDomainRepository;
        this.companyDomainMapper = companyDomainMapper;
    }

    @Override
    public CompanyDomainDTO save(CompanyDomainDTO companyDomainDTO) {
        log.debug("Request to save CompanyDomain : {}", companyDomainDTO);
        CompanyDomain companyDomain = companyDomainMapper.toEntity(companyDomainDTO);
        companyDomain = companyDomainRepository.save(companyDomain);
        return companyDomainMapper.toDto(companyDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDomainDTO> findAll() {
        log.debug("Request to get all CompanyDomains");
        return companyDomainRepository.findAll().stream()
            .map(companyDomainMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyDomainDTO> findOne(Long id) {
        log.debug("Request to get CompanyDomain : {}", id);
        return companyDomainRepository.findById(id)
            .map(companyDomainMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete CompanyDomain : {}", id);
        companyDomainRepository.deleteById(id);
    }

    @Override
    public List<CompanyDomainDTO> findAllCompanyDomainsByCompanyId(Long companyId) {
        return companyDomainRepository.findAllCompanyDomainsByCompanyId(companyId)
            .stream()
            .map(companyDomainMapper::toDto)
            .collect(Collectors.toCollection(ArrayList::new));
    }
}
