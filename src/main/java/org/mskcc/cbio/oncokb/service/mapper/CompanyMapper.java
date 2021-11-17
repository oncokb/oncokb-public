package org.mskcc.cbio.oncokb.service.mapper;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mskcc.cbio.oncokb.domain.*;
import org.mskcc.cbio.oncokb.repository.CompanyDomainRepository;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for the entity {@link Company} and its DTO {@link CompanyDTO}.
 */
@Mapper(componentModel = "spring", uses = {CompanyDomainMapper.class})
public abstract class CompanyMapper implements EntityMapper<CompanyDTO, Company> {

    @Autowired
    CompanyDomainRepository companyDomainRepository;

    @Mapping(target = "removeDomain", ignore = true)

    protected Set<String> fromCompanyDomain(Set<CompanyDomain> companyDomains) {
        return companyDomains.stream()
            .map(companyDomain -> companyDomain.getName())
            .collect(Collectors.toCollection(HashSet::new));
    }

    protected Set<CompanyDomain> fromCompanyDomainString(Set<String> companyDomainStrings) {
        return companyDomainStrings.stream()
            .map(name -> {
                // When the name of the company domain exists, then use that companyDomain entity
                // Otherwise, we save the new domain entity with the company
                Optional<CompanyDomain> optionalDomain = companyDomainRepository.findOneByNameIgnoreCase(name);
                if(optionalDomain.isPresent()){
                    return optionalDomain.get();
                }
                CompanyDomain domain = new CompanyDomain();
                domain.setName(name);
                return domain;
            })
            .collect(Collectors.toCollection(HashSet::new));
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