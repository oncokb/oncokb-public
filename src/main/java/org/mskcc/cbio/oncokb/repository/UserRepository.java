package org.mskcc.cbio.oncokb.repository;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.projection.SendEmailUserOptionProjection;
import org.mskcc.cbio.oncokb.repository.projection.UserWithDetailsProjection;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.Instant;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;

/**
 * Spring Data JPA repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);

    @Query("select user from User user where user.activated=true and user not in (select token.user from Token token)")
    List<User> findAllActivatedWithoutTokens();

    // Get all registered users
    Page<User> findAllByActivatedIsTrueOrderByCreatedBy(Pageable pageable);

    Optional<User> findOneByResetKey(String resetKey);

    Optional<User> findOneById(Long id);

    @EntityGraph(attributePaths = "authorities")
    @Cacheable(cacheResolver = "userCacheResolver")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    @Cacheable(cacheResolver = "userCacheResolver")
    Optional<User> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    @Query("select user from User user where :authorityName not in (select authority.name FROM user.authorities authority) and user.login != :login")
    List<User> findAllUsersWithoutAuthorityAndLoginNot(@Param("authorityName") String authorityName, @Param("login") String login);

    @Query(
        value = "SELECT u.id " +
            "FROM jhi_user u " +
            "LEFT JOIN user_details ud ON ud.user_id = u.id " +
            "WHERE u.login <> :anonymousLogin " +
            "AND NOT EXISTS (" +
            "  SELECT 1 FROM jhi_user_authority ua " +
            "  WHERE ua.user_id = u.id AND ua.authority_name = :excludedAuthority" +
            ") " +
            "AND (:query IS NULL OR :query = '' " +
            "  OR LOWER(u.login) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.email) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.first_name) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.last_name) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.job_title, '')) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.company_name, '')) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.city, '')) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.country, '')) LIKE CONCAT('%', LOWER(:query), '%')) " +
            "AND (:emailVerified IS NULL OR " +
            "  (CASE WHEN u.activation_key IS NULL OR u.activated = TRUE THEN TRUE ELSE FALSE END) = :emailVerified) " +
            "AND (:licenseTypesEmpty = TRUE OR ud.license_type IN (:licenseTypes)) " +
            "AND (:rolesEmpty = TRUE OR EXISTS (" +
            "  SELECT 1 FROM jhi_user_authority ua2 " +
            "  WHERE ua2.user_id = u.id AND ua2.authority_name IN (:roles)" +
            ")) " +
            "ORDER BY u.created_date DESC, COALESCE(ud.company_name, ''), COALESCE(u.last_name, ''), u.id DESC",
        countQuery = "SELECT COUNT(*) " +
            "FROM jhi_user u " +
            "LEFT JOIN user_details ud ON ud.user_id = u.id " +
            "WHERE u.login <> :anonymousLogin " +
            "AND NOT EXISTS (" +
            "  SELECT 1 FROM jhi_user_authority ua " +
            "  WHERE ua.user_id = u.id AND ua.authority_name = :excludedAuthority" +
            ") " +
            "AND (:query IS NULL OR :query = '' " +
            "  OR LOWER(u.login) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.email) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.first_name) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.last_name) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.job_title, '')) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.company_name, '')) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.city, '')) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(COALESCE(ud.country, '')) LIKE CONCAT('%', LOWER(:query), '%')) " +
            "AND (:emailVerified IS NULL OR " +
            "  (CASE WHEN u.activation_key IS NULL OR u.activated = TRUE THEN TRUE ELSE FALSE END) = :emailVerified) " +
            "AND (:licenseTypesEmpty = TRUE OR ud.license_type IN (:licenseTypes)) " +
            "AND (:rolesEmpty = TRUE OR EXISTS (" +
            "  SELECT 1 FROM jhi_user_authority ua2 " +
            "  WHERE ua2.user_id = u.id AND ua2.authority_name IN (:roles)" +
            "))",
        nativeQuery = true
    )
    Page<Number> findManagedUserIdsForUserDetailsPage(
        @Param("query") String query,
        @Param("emailVerified") Boolean emailVerified,
        @Param("licenseTypes") List<String> licenseTypes,
        @Param("licenseTypesEmpty") boolean licenseTypesEmpty,
        @Param("roles") List<String> roles,
        @Param("rolesEmpty") boolean rolesEmpty,
        @Param("anonymousLogin") String anonymousLogin,
        @Param("excludedAuthority") String excludedAuthority,
        Pageable pageable
    );

    @Query("select distinct user from User user left join fetch user.authorities left join fetch user.userMails where user.id in :ids")
    List<User> findAllWithAuthoritiesAndUserMailsByIdIn(@Param("ids") List<Long> ids);

    @Query("select distinct user from User user join user.authorities authority where authority.name = :authorityName and user.login <> :login")
    List<User> findAllUsersWithAuthorityAndLoginNot(@Param("authorityName") String authorityName, @Param("login") String login);

    default List<User> findAllApiUsers() {
        return findAllUsersWithAuthorityAndLoginNot(AuthoritiesConstants.API, org.mskcc.cbio.oncokb.config.Constants.ANONYMOUS_USER);
    }

    @Query(
        "select new org.mskcc.cbio.oncokb.repository.projection.UserWithDetailsView(user, userDetails) " +
            "from User as user left join UserDetails as userDetails on user.id = userDetails.user " +
            "where user in ?1"
    )
    List<UserWithDetailsProjection> findAllUsersWithUserDetailsByUsersIn(List<User> users);

    @Query(
        "select distinct new org.mskcc.cbio.oncokb.repository.projection.UserWithDetailsView(user, userDetails) from User user " +
            "left join UserDetails userDetails on userDetails.user = user " +
            "where lower(user.login) in :candidates or lower(user.email) in :candidates"
    )
    List<UserWithDetailsProjection> findUsersWithDetailsByLoginOrEmailIn(@Param("candidates") java.util.List<String> candidates);

    @Query(
        value = "SELECT u.login AS login, u.email AS email, u.first_name AS firstName, u.last_name AS lastName, " +
            "u.activated AS activated, ud.license_type AS licenseType, " +
            "CASE WHEN EXISTS (" +
            "  SELECT 1 FROM jhi_user_authority ua " +
            "  WHERE ua.user_id = u.id AND ua.authority_name = 'ROLE_ADMIN'" +
            ") THEN true ELSE false END AS isAdmin " +
            "FROM jhi_user u " +
            "LEFT JOIN user_details ud ON ud.user_id = u.id " +
            "WHERE u.login <> :anonymousLogin " +
            "AND (:query IS NULL OR :query = '' " +
            "  OR LOWER(u.login) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.email) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.first_name) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.last_name) LIKE CONCAT('%', LOWER(:query), '%'))",
        countQuery = "SELECT COUNT(*) " +
            "FROM jhi_user u " +
            "WHERE u.login <> :anonymousLogin " +
            "AND (:query IS NULL OR :query = '' " +
            "  OR LOWER(u.login) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.email) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.first_name) LIKE CONCAT('%', LOWER(:query), '%') " +
            "  OR LOWER(u.last_name) LIKE CONCAT('%', LOWER(:query), '%'))",
        nativeQuery = true
    )
    Page<SendEmailUserOptionProjection> findSendEmailUserOptions(
        @Param("query") String query,
        @Param("anonymousLogin") String anonymousLogin,
        Pageable pageable
    );
}
