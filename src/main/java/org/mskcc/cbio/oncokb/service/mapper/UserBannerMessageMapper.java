package org.mskcc.cbio.oncokb.service.mapper;

import java.time.LocalDate;
import java.time.ZoneOffset;
import org.mapstruct.*;
import org.mskcc.cbio.oncokb.domain.UserBannerMessage;
import org.mskcc.cbio.oncokb.domain.enumeration.UserBannerMessageStatus;
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

  @AfterMapping
  default void setStatus(
    @MappingTarget UserBannerMessageDTO dto,
    UserBannerMessage entity
  ) {
    if (dto == null) {
      return;
    }
    dto.setStatus(calculateStatus(entity.getStartDate(), entity.getEndDate()));
  }

  default UserBannerMessageStatus calculateStatus(
    LocalDate startDate,
    LocalDate endDate
  ) {
    if (startDate == null || endDate == null) {
      return UserBannerMessageStatus.UNKNOWN;
    }

    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    if (today.isBefore(startDate)) {
      return UserBannerMessageStatus.SCHEDULED;
    }
    if (today.isAfter(endDate)) {
      return UserBannerMessageStatus.EXPIRED;
    }
    return UserBannerMessageStatus.ACTIVE;
  }

  default UserBannerMessage fromId(Long id) {
    if (id == null) {
      return null;
    }
    UserBannerMessage userBannerMessage = new UserBannerMessage();
    userBannerMessage.setId(id);
    return userBannerMessage;
  }
}
