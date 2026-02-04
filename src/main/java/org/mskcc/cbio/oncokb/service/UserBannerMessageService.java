package org.mskcc.cbio.oncokb.service;

import java.util.List;
import java.util.Optional;
import org.mskcc.cbio.oncokb.service.dto.UserBannerMessageDTO;

/**
 * Service Interface for managing {@link org.mskcc.cbio.oncokb.domain.UserBannerMessage}.
 */
public interface UserBannerMessageService {
  /**
   * Save a userBannerMessage.
   *
   * @param userBannerMessageDTO the entity to save.
   * @return the persisted entity.
   */
  UserBannerMessageDTO save(UserBannerMessageDTO userBannerMessageDTO);

  /**
   * Get all the userBannerMessages.
   *
   * @return the list of entities.
   */
  List<UserBannerMessageDTO> findAll();

  /**
   * Get banner messages that should currently be shown.
   *
   * @return the list of active banner messages.
   */
  List<UserBannerMessageDTO> findAllActive();

  /**
   * Get the "id" userBannerMessage.
   *
   * @param id the id of the entity.
   * @return the entity.
   */
  Optional<UserBannerMessageDTO> findOne(Long id);

  /**
   * Delete the "id" userBannerMessage.
   *
   * @param id the id of the entity.
   */
  void delete(Long id);
}
