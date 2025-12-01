package org.mskcc.cbio.oncokb.service.mapper;

import org.mapstruct.*;
import org.mskcc.cbio.oncokb.domain.UserBannerMessage;
import org.mskcc.cbio.oncokb.service.dto.UserBannerMessageDTO;

/**
 * Mapper for the entity {@link UserBannerMessage} and its DTO {@link UserBannerMessageDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public interface UserBannerMessageMapper
  extends EntityMapper<UserBannerMessageDTO, UserBannerMessage> {
  @Override
  UserBannerMessage toEntity(UserBannerMessageDTO dto);

  @Override
  UserBannerMessageDTO toDto(UserBannerMessage entity);

  default UserBannerMessage fromId(Long id) {
    if (id == null) {
      return null;
    }
    UserBannerMessage userBannerMessage = new UserBannerMessage();
    userBannerMessage.setId(id);
    return userBannerMessage;
  }
}
