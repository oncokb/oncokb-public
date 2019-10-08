package org.mskcc.cbio.oncokb.repository;
import org.mskcc.cbio.oncokb.domain.Token;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data  repository for the Token entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    @Query("select token from Token token where token.user.login = ?#{principal.username}")
    List<Token> findByUserIsCurrentUser();

}
