package org.mskcc.cbio.oncokb.repository;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.UserMails;

import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import io.github.jhipster.config.JHipsterProperties.Mail;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data repository for the UserMails entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserMailsRepository extends JpaRepository<UserMails, Long> {

    @Query("select userMails from UserMails userMails where userMails.user.login = ?#{principal.username}")
    List<UserMails> findByUserIsCurrentUser();

    @Query("select userMails from UserMails userMails where userMails.user.login = ?1")
    List<UserMails> findByUser(String login);

    @Query(
        "select userMails from UserMails userMails where " +
            "(:query is null or :query = '' or " +
            " lower(userMails.user.login) like lower(concat('%', :query, '%')) or " +
            " lower(userMails.sentBy) like lower(concat('%', :query, '%')) or " +
            " lower(userMails.sentFrom) like lower(concat('%', :query, '%')) or " +
            " lower(str(userMails.mailType)) like lower(concat('%', :query, '%')))"
    )
    Page<UserMails> findAllForSendEmailPage(@Param("query") String query, Pageable pageable);

    List<UserMails> findUserMailsByUserAndMailTypeAndSentDateAfter(User user, MailType mailType, Instant sentAfter);

    List<UserMails> findUserMailByUserAndMailTypeIn(User user, List<MailType> mailTypes);

    void deleteAllByUser(User user);
}
