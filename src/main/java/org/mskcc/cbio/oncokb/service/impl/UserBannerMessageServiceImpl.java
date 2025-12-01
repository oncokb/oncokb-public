package org.mskcc.cbio.oncokb.service.impl;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.mskcc.cbio.oncokb.domain.UserBannerMessage;
import org.mskcc.cbio.oncokb.repository.UserBannerMessageRepository;
import org.mskcc.cbio.oncokb.service.UserBannerMessageService;
import org.mskcc.cbio.oncokb.service.dto.UserBannerMessageDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserBannerMessageMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link UserBannerMessage}.
 */
@Service
@Transactional
public class UserBannerMessageServiceImpl implements UserBannerMessageService {
  private final Logger log = LoggerFactory.getLogger(
    UserBannerMessageServiceImpl.class
  );

  private final UserBannerMessageRepository userBannerMessageRepository;

  private final UserBannerMessageMapper userBannerMessageMapper;

  public UserBannerMessageServiceImpl(
    UserBannerMessageRepository userBannerMessageRepository,
    UserBannerMessageMapper userBannerMessageMapper
  ) {
    this.userBannerMessageRepository = userBannerMessageRepository;
    this.userBannerMessageMapper = userBannerMessageMapper;
  }

  @Override
  public UserBannerMessageDTO save(UserBannerMessageDTO userBannerMessageDTO) {
    log.debug("Request to save UserBannerMessage : {}", userBannerMessageDTO);
    UserBannerMessage userBannerMessage = userBannerMessageMapper.toEntity(
      userBannerMessageDTO
    );
    userBannerMessage = userBannerMessageRepository.save(userBannerMessage);
    return userBannerMessageMapper.toDto(userBannerMessage);
  }

  @Override
  @Transactional(readOnly = true)
  public List<UserBannerMessageDTO> findAll() {
    log.debug("Request to get all UserBannerMessages");
    return userBannerMessageRepository
      .findAll()
      .stream()
      .map(userBannerMessageMapper::toDto)
      .collect(Collectors.toCollection(LinkedList::new));
  }

  @Override
  @Transactional(readOnly = true)
  public List<UserBannerMessageDTO> findAllActive() {
    log.debug("Request to get active UserBannerMessages");
    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    return userBannerMessageRepository
      .findActiveBannerMessages(today)
      .stream()
      .map(userBannerMessageMapper::toDto)
      .collect(Collectors.toCollection(LinkedList::new));
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<UserBannerMessageDTO> findOne(Long id) {
    log.debug("Request to get UserBannerMessage : {}", id);
    return userBannerMessageRepository
      .findById(id)
      .map(userBannerMessageMapper::toDto);
  }

  @Override
  public void delete(Long id) {
    log.debug("Request to delete UserBannerMessage : {}", id);
    userBannerMessageRepository.deleteById(id);
  }
}
