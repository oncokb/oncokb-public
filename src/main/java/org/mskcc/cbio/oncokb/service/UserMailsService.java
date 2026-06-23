package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.config.cache.CacheNameResolver;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserMails;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.repository.UserMailsRepository;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMailsMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.mskcc.cbio.oncokb.config.cache.UserCacheResolver.ALL_USERS_CACHE;
import static org.mskcc.cbio.oncokb.config.cache.UserCacheResolver.USERS_BY_EMAIL_CACHE;
import static org.mskcc.cbio.oncokb.config.cache.UserCacheResolver.USERS_BY_LOGIN_CACHE;

/**
 * Service Implementation for managing {@link UserMails}.
 */
@Service
@Transactional
public class UserMailsService {

    private final Logger log = LoggerFactory.getLogger(UserMailsService.class);

    private final UserMailsRepository userMailsRepository;

    private final UserMailsMapper userMailsMapper;

    private final CacheManager cacheManager;

    private final CacheNameResolver cacheNameResolver;

    public UserMailsService(
        UserMailsRepository userMailsRepository,
        UserMailsMapper userMailsMapper,
        CacheManager cacheManager,
        CacheNameResolver cacheNameResolver
    ) {
        this.userMailsRepository = userMailsRepository;
        this.userMailsMapper = userMailsMapper;
        this.cacheManager = cacheManager;
        this.cacheNameResolver = cacheNameResolver;
    }

    /**
     * Save a userMails.
     *
     * @param userMailsDTO the entity to save.
     * @return the persisted entity.
     */
    public UserMailsDTO save(UserMailsDTO userMailsDTO) {
        log.debug("Request to save UserMails : {}", userMailsDTO);
        UserMails userMails = userMailsMapper.toEntity(userMailsDTO);
        userMails = userMailsRepository.save(userMails);
        clearUserCaches(userMails.getUser());
        return userMailsMapper.toDto(userMails);
    }

    /**
     * Get all the userMails.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<UserMailsDTO> findAll() {
        log.debug("Request to get all UserMails");
        return userMailsRepository.findAll().stream()
            .map(userMailsMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }


    /**
     * Get all userMails for a particular user
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<UserMailsDTO> findUserAll(String login) {
        log.debug("Request to get all UserMails for a particular user");
        return userMailsRepository.findByUser(login).stream()
            .map(userMailsMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public List<UserMailsDTO> findUserMailsByUserAndMailTypeAndSentDateAfter(User user, MailType mailType, Instant sentAfter) {
        log.debug("Request to get all UserMails for a particular user");
        if (sentAfter == null) {
            sentAfter = Instant.EPOCH;
        }

        return userMailsRepository.findUserMailsByUserAndMailTypeAndSentDateAfter(user, mailType, sentAfter).stream()
            .map(userMailsMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public List<UserMailsDTO> findUserMailsByUserAndMailTypeIn(User user, List<MailType> mailTypes) {
        log.debug("Request to get all UserMails in a list of mail types for a particular user");

        return userMailsRepository.findUserMailByUserAndMailTypeIn(user, mailTypes).stream()
            .map(userMailsMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one userMails by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<UserMailsDTO> findOne(Long id) {
        log.debug("Request to get UserMails : {}", id);
        return userMailsRepository.findById(id)
            .map(userMailsMapper::toDto);
    }

    /**
     * Delete the userMails by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete UserMails : {}", id);
        Optional<UserMails> userMails = userMailsRepository.findById(id);
        userMailsRepository.deleteById(id);
        if (userMails.isPresent()) {
            clearUserCaches(userMails.get().getUser());
        }
    }

    /**
     * Delete all mails related to the user
     *
     * @param user
     */
    public void deleteAllByUser(User user) {
        log.debug("Request to delete all UserMails related to user: {}", user);
        userMailsRepository.deleteAllByUser(user);
        clearUserCaches(user);
    }

    private void clearUserCaches(User user) {
        if (user != null && user.getLogin() != null) {
            evictCacheKey(this.cacheNameResolver.getCacheName(USERS_BY_LOGIN_CACHE), user.getLogin());
        }
        if (user != null && user.getEmail() != null) {
            evictCacheKey(this.cacheNameResolver.getCacheName(USERS_BY_EMAIL_CACHE), user.getEmail());
        }
        evictCacheKey(this.cacheNameResolver.getCacheName(ALL_USERS_CACHE), "getAllManagedUsers");
    }

    private void evictCacheKey(String cacheName, String key) {
        if (cacheManager.getCache(cacheName) != null) {
            Objects.requireNonNull(cacheManager.getCache(cacheName)).evict(key);
        }
    }
}
