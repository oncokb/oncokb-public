package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.CompanyDomain;
import org.mskcc.cbio.oncokb.repository.CompanyRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyDomainMapper;
import org.mskcc.cbio.oncokb.service.mapper.CompanyMapper;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing {@link Company}.
 */
@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final Logger log = LoggerFactory.getLogger(CompanyServiceImpl.class);

    private final CompanyRepository companyRepository;

    private final CompanyMapper companyMapper;

    private final CompanyDomainService companyDomainService;

    private final CompanyDomainMapper companyDomainMapper;

    public CompanyServiceImpl(CompanyRepository companyRepository, CompanyMapper companyMapper, CompanyDomainService companyDomainService, CompanyDomainMapper companyDomainMapper) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.companyDomainService = companyDomainService;
        this.companyDomainMapper = companyDomainMapper;

    }

    @Override
    public CompanyDTO save(CompanyVM companyVm) {
        log.debug("Request to save Company : {}", companyVm);
        Company company = companyMapper.toEntity(companyVm);
        company = companyRepository.save(company);

        for(String domainName: companyVm.getCompanyDomains()){
            CompanyDomain domain = new CompanyDomain();
            domain.setName(domainName);
            domain.setCompany(company);
            companyDomainService.save(companyDomainMapper.toDto(domain));
        }

        return companyMapper.toDto(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAll() {
        log.debug("Request to get all Companies");
        return companyRepository.findAll().stream()
            .map(companyMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyDTO> findOne(Long id) {
        log.debug("Request to get Company : {}", id);
        return companyRepository.findById(id)
            .map(companyMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Company : {}", id);
        companyRepository.deleteById(id);
    }
}
