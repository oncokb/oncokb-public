package org.mskcc.cbio.oncokb.service.mapper;

import org.mapstruct.Mapper;
import org.mskcc.cbio.oncokb.domain.SuspiciousEmailDomain;
import org.mskcc.cbio.oncokb.service.dto.SuspiciousEmailDomainDTO;

@Mapper(componentModel = "spring", uses = {})
public interface SuspiciousEmailDomainMapper extends EntityMapper<SuspiciousEmailDomainDTO, SuspiciousEmailDomain> {

    default SuspiciousEmailDomain fromId(Long id) {
        if (id == null) {
            return null;
        }
        SuspiciousEmailDomain suspiciousEmailDomain = new SuspiciousEmailDomain();
        suspiciousEmailDomain.setId(id);
        return suspiciousEmailDomain;
    }
}
