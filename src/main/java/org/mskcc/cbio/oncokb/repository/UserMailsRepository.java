package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.UserMails;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data  repository for the UserMails entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserMailsRepository extends JpaRepository<UserMails, Long> {

    @Query("select userMails from UserMails userMails where userMails.user.login = ?#{principal.username}")
    List<UserMails> findByUserIsCurrentUser();

}
