package org.mskcc.cbio.oncokb.security;

import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.domain.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for the {@link SecurityUtils} utility class.
 */
public class SecurityUtilsUnitTest {

    @Test
    public void testGetCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken("admin", "admin"));
        SecurityContextHolder.setContext(securityContext);
        Optional<String> login = SecurityUtils.getCurrentUserLogin();
        assertThat(login).contains("admin");
    }

    @Test
    public void testGetCurrentUserToken() {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        UUID uuid = UUID.randomUUID();
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken("admin", uuid));
        SecurityContextHolder.setContext(securityContext);
        Optional<UUID> token = SecurityUtils.getCurrentUserToken();
        assertThat(token).isNotEmpty();
        assertThat(token.get().toString()).isEqualTo(uuid.toString());
    }

    @Test
    public void testIsAuthenticated() {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken("admin", "admin"));
        SecurityContextHolder.setContext(securityContext);
        boolean isAuthenticated = SecurityUtils.isAuthenticated();
        assertThat(isAuthenticated).isTrue();
    }

    @Test
    public void testAnonymousIsNotAuthenticated() {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(AuthoritiesConstants.ANONYMOUS));
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken("anonymous", "anonymous", authorities));
        SecurityContextHolder.setContext(securityContext);
        boolean isAuthenticated = SecurityUtils.isAuthenticated();
        assertThat(isAuthenticated).isFalse();
    }

    @Test
    public void testIsCurrentUserInRole() {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(AuthoritiesConstants.USER));
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken("user", "user", authorities));
        SecurityContextHolder.setContext(securityContext);

        assertThat(SecurityUtils.isCurrentUserInRole(AuthoritiesConstants.USER)).isTrue();
        assertThat(SecurityUtils.isCurrentUserInRole(AuthoritiesConstants.ADMIN)).isFalse();
    }

    @Test
    public void getActivationGracePeriodDaysRemainingRoundsUpForPartialDay() {
        Instant reference = Instant.now();
        // Leave roughly 1 hour remaining in the grace period
        Instant createdDate = reference.minus(Duration.ofDays(14)).plus(Duration.ofHours(1));
        User user = createUserWithCreatedDate(createdDate);

        long daysRemaining = SecurityUtils.getActivationGracePeriodDaysRemaining(user);

        assertThat(daysRemaining).isEqualTo(1);
    }

    @Test
    public void getActivationGracePeriodDaysRemainingRoundsUpWhenMoreThanOneDayLeft() {
        Instant reference = Instant.now();
        // Leave 1 day and 1 hour remaining so rounding adds the extra day
        Instant createdDate = reference.minus(Duration.ofDays(12)).minus(Duration.ofHours(1));
        User user = createUserWithCreatedDate(createdDate);

        long daysRemaining = SecurityUtils.getActivationGracePeriodDaysRemaining(user);

        assertThat(daysRemaining).isEqualTo(2);
    }

    @Test
    public void getActivationGracePeriodDaysRemainingReturnsZeroOutsideGracePeriod() {
        Instant reference = Instant.now();
        // Grace period already expired
        Instant createdDate = reference.minus(Duration.ofDays(14));
        User user = createUserWithCreatedDate(createdDate);

        long daysRemaining = SecurityUtils.getActivationGracePeriodDaysRemaining(user);

        assertThat(daysRemaining).isZero();
    }

    @Test
    public void getActivationGracePeriodDaysRemainingReturnsZeroWhenDurationNegative() {
        Instant reference = Instant.now();
        // Created far enough in the past so the grace period ended before now
        Instant createdDate = reference.minus(Duration.ofDays(16));
        User user = createUserWithCreatedDate(createdDate);

        long daysRemaining = SecurityUtils.getActivationGracePeriodDaysRemaining(user);

        assertThat(daysRemaining).isZero();
    }

    private User createUserWithCreatedDate(Instant createdDate) {
        User user = new User();
        user.setCreatedDate(createdDate);
        return user;
    }

}
