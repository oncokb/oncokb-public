package org.mskcc.cbio.oncokb.service.mapper;


import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mskcc.cbio.oncokb.domain.*;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for the entity {@link Company} and its DTO {@link CompanyDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public abstract class CompanyMapper implements EntityMapper<CompanyDTO, Company> {

    @Autowired
    CompanyDomainRepository companyDomainRepository;

    /**
     * Called after a Company is mapped to a CompanyDTO. The domains
     * associated with the company will be retrieved and added to the 
     * companyDTO.
     * @param companyDTO the companyDTO mapped from company entity
     */
    @AfterMapping
    protected void updateResult(@MappingTarget CompanyDTO companyDTO){
        Set<String> domainNames = 
            companyDomainRepository
                .findAllCompanyDomainsByCompanyId(companyDTO.getId())
                .stream()
                .map(companyDomainDTO -> companyDomainDTO.getName())
                .collect(Collectors.toCollection(HashSet::new));
        companyDTO.setCompanyDomains(domainNames);
    }

    protected Company fromId(Long id) {
        if (id == null) {
            return null;
        }
        Company company = new Company();
        company.setId(id);
        return company;
    }

}