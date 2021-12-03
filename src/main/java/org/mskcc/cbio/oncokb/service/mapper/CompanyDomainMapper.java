package org.mskcc.cbio.oncokb.service.mapper;


import org.mskcc.cbio.oncokb.domain.*;
import org.mskcc.cbio.oncokb.service.dto.CompanyDomainDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link CompanyDomain} and its DTO {@link CompanyDomainDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public interface CompanyDomainMapper extends EntityMapper<CompanyDomainDTO, CompanyDomain> {


    @Mapping(target = "companies", ignore = true)
    @Mapping(target = "removeCompany", ignore = true)
    CompanyDomain toEntity(CompanyDomainDTO companyDomainDTO);

    default CompanyDomain fromId(Long id) {
        if (id == null) {
            return null;
        }
        CompanyDomain companyDomain = new CompanyDomain();
        companyDomain.setId(id);
        return companyDomain;
    }
}
