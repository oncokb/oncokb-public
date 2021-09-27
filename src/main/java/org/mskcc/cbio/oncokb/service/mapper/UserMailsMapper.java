package org.mskcc.cbio.oncokb.service.mapper;


import org.mskcc.cbio.oncokb.domain.*;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link UserMails} and its DTO {@link UserMailsDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface UserMailsMapper extends EntityMapper<UserMailsDTO, UserMails> {

    @Mapping(source = "user.id", target = "userId")
    UserMailsDTO toDto(UserMails userMails);

    @Mapping(source = "userId", target = "user")
    UserMails toEntity(UserMailsDTO userMailsDTO);

    default UserMails fromId(Long id) {
        if (id == null) {
            return null;
        }
        UserMails userMails = new UserMails();
        userMails.setId(id);
        return userMails;
    }
}
