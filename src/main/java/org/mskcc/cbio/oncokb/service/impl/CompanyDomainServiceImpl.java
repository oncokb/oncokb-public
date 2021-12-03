package org.mskcc.cbio.oncokb.service.impl;

import org.mskcc.cbio.oncokb.service.CompanyDomainService;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.CompanyDomain;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseModel;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;
import org.mskcc.cbio.oncokb.service.mapper.CompanyDomainMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
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
    public List<CompanyDomainDTO> verifyCompanyDomains(List<String> names, Long companyId){
        // Get a list of company domains based on the name
        List<CompanyDomain> companyDomains = names.stream()
            .map(name -> companyDomainRepository.findOneByNameIgnoreCase(name))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toCollection(LinkedList::new));

        // Check if a companyDomain is associated with another company that is on a regular license
        // If so, then we return the conflicting companyDomains
        List<CompanyDomain> conflictingCompanyDomains = new LinkedList<>();
        for(CompanyDomain companyDomain: companyDomains){
            boolean hasConflict = companyDomain
                .getCompanies()
                .stream()
                .filter(company -> {
                    boolean isRegular = company.getLicenseModel().equals(LicenseModel.REGULAR);
                    boolean dontSkipCompany = true;
                    if(companyId != null){
                        dontSkipCompany = !company.getId().equals(companyId);
                    }
                    return isRegular && dontSkipCompany;
                })
                .collect(Collectors.toCollection(LinkedList::new))
                .size() > 0;
            if(hasConflict){
                conflictingCompanyDomains.add(companyDomain);
            }
        }
        return companyDomainMapper.toDto(conflictingCompanyDomains);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete CompanyDomain : {}", id);
        companyDomainRepository.deleteById(id);
    }
}
