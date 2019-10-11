package org.mskcc.cbio.oncokb.repository;
import org.mskcc.cbio.oncokb.domain.Token;
import org.mskcc.cbio.oncokb.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

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

    Optional<Token> findByToken(UUID token);

    List<Token> findByUser(User user);
}
