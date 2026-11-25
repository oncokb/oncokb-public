package org.mskcc.cbio.oncokb.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mskcc.cbio.oncokb.domain.BenchmarkingAgreement;
import org.mskcc.cbio.oncokb.service.dto.BenchmarkingAgreementDTO;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface BenchmarkingAgreementMapper extends EntityMapper<BenchmarkingAgreementDTO, BenchmarkingAgreement> {

    @Mapping(source = "user.id", target = "userId")
    BenchmarkingAgreementDTO toDto(BenchmarkingAgreement benchmarkingAgreement);

    @Mapping(source = "userId", target = "user")
    BenchmarkingAgreement toEntity(BenchmarkingAgreementDTO benchmarkingAgreementDTO);
}
