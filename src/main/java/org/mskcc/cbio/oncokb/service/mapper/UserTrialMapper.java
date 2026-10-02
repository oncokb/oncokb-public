package org.mskcc.cbio.oncokb.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mskcc.cbio.oncokb.domain.UserTrial;
import org.mskcc.cbio.oncokb.service.dto.UserTrialDTO;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface UserTrialMapper extends EntityMapper<UserTrialDTO, UserTrial> {

    @Mapping(source = "user.id", target = "userId")
    UserTrialDTO toDto(UserTrial userTrial);

    @Mapping(source = "userId", target = "user")
    UserTrial toEntity(UserTrialDTO userTrialDTO);
}
