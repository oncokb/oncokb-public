package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data  repository for the Token entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    @Query("select token from Token token where token.user.login = ?#{principal.username}")
    List<Token> findByUserIsCurrentUser();

    @Modifying
    @Query("update Token token set token.currentUsage=token.currentUsage + ?2 where token.id = ?1")
    void increaseTokenUsage(Long id, int increment);

    @Query("select token from Token token where token.expiration < ?1")
    List<Token> findAllExpiresBeforeDate(Instant date);

    Optional<Token> findByToken(UUID token);

    List<Token> findByUser(User user);
}
