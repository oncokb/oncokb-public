package org.mskcc.cbio.oncokb.service.mapper;


import com.google.gson.Gson;
import org.mskcc.cbio.oncokb.domain.*;
import org.mskcc.cbio.oncokb.service.dto.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link UserDetails} and its DTO {@link UserDetailsDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface UserDetailsMapper extends EntityMapper<UserDetailsDTO, UserDetails> {

    @Mapping(source = "user.id", target = "userId")
    UserDetailsDTO toDto(UserDetails userDetails);

    @Mapping(source = "userId", target = "user")
    UserDetails toEntity(UserDetailsDTO userDetailsDTO);

    default UserDetails fromId(Long id) {
        if (id == null) {
            return null;
        }
        UserDetails userDetails = new UserDetails();
        userDetails.setId(id);
        return userDetails;
    }

    default String fromAdditionalInfo(AdditionalInfoDTO additionalInfo) {
        return new Gson().toJson(additionalInfo);
    }

    default AdditionalInfoDTO toAdditionalInfo(String additionalInfo) {
        return new Gson().fromJson(additionalInfo, AdditionalInfoDTO.class);
    }
}
