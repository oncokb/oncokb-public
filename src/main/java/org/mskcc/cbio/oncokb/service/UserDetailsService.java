package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.service.dto.UserDetailsDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link org.mskcc.cbio.oncokb.domain.UserDetails}.
 */
public interface UserDetailsService {

    /**
     * Save a userDetails.
     *
     * @param userDetailsDTO the entity to save.
     * @return the persisted entity.
     */
    UserDetailsDTO save(UserDetailsDTO userDetailsDTO);

    /**
     * Get all the userDetails.
     *
     * @return the list of entities.
     */
    List<UserDetailsDTO> findAll();


    /**
     * Get the "id" userDetails.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<UserDetailsDTO> findOne(Long id);

    /**
     * Delete the "id" userDetails.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    Optional<UserDetailsDTO> findOneByTrialActivationKey(String key);
}
