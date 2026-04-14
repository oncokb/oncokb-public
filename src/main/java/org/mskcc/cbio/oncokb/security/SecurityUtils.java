package org.mskcc.cbio.oncokb.security;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Utility class for Spring Security.
 */
public final class SecurityUtils {

    private static final Duration ACTIVATION_GRACE_PERIOD = Duration.ofDays(30);
    // For users created before April 1, 2026, we will use April 1, 2026 as the created date for calculating the grace period end
    // This is to ensure that all users have at least 30 days of grace period, even if they were created a long time ago
    // This should be removed 30 days after April 1st, 2026
    private static final Instant ACTIVATION_GRACE_PERIOD_CREATED_DATE_FLOOR =
        LocalDate.of(2026, 4, 1).atStartOfDay().toInstant(ZoneOffset.UTC);

    private SecurityUtils() {
    }

    /**
     * Get the login of the current user.
     *
     * @return the login of the current user.
     */
    public static Optional<String> getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(extractPrincipal(securityContext.getAuthentication()));
    }

    private static String extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else if (authentication.getPrincipal() instanceof UserDetails) {
            UserDetails springSecurityUser = (UserDetails) authentication.getPrincipal();
            return springSecurityUser.getUsername();
        } else if (authentication.getPrincipal() instanceof String) {
            return (String) authentication.getPrincipal();
        }
        return null;
    }


    /**
     * Get the uuid of the current user.
     *
     * @return the uuid of the current user.
     */
    public static Optional<UUID> getCurrentUserToken() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(securityContext.getAuthentication())
            .filter(authentication -> authentication.getCredentials() instanceof UUID)
            .map(authentication -> (UUID) authentication.getCredentials());
    }

    /**
     * Check if a user is authenticated.
     *
     * @return true if the user is authenticated, false otherwise.
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
            getAuthorities(authentication).noneMatch(AuthoritiesConstants.ANONYMOUS::equals);
    }

    /**
     * If the current user has a specific authority (security role).
     * <p>
     * The name of this method comes from the {@code isUserInRole()} method in the Servlet API.
     *
     * @param authority the authority to check.
     * @return true if the current user has the authority, false otherwise.
     */
    public static boolean isCurrentUserInRole(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
            getAuthorities(authentication).anyMatch(authority::equals);
    }

    private static Stream<String> getAuthorities(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority);
    }

    public static boolean isWithinActivationGracePeriod(User user, LicenseType licenseType) {
        if (licenseType.equals(LicenseType.ACADEMIC) || licenseType.equals(LicenseType.HOSPITAL)) {
            return true;
        }

        return getGracePeriodEnd(user)
            .map(end -> Instant.now().isBefore(end))
            .orElse(false);
    }

    public static long getActivationGracePeriodDaysRemaining(User user, LicenseType licenseType) {
        if (licenseType.equals(LicenseType.ACADEMIC) || licenseType.equals(LicenseType.HOSPITAL)) {
            return 3650; // ten years, a pretty long time
        }

        Optional<Instant> gracePeriodEnd = getGracePeriodEnd(user);
        if (!gracePeriodEnd.isPresent()) {
            return 0;
        }
        Instant start = Instant.now();
        Instant end = gracePeriodEnd.get();

        if (!start.isBefore(end)) {
            return 0;
        }

        // round up to the nearest whole day
        Duration duration = Duration.between(start, end);

        long seconds = duration.getSeconds();
        long secondsPerDay = 24 * 60 * 60;

        long days = seconds / secondsPerDay;
        long remainder = seconds % secondsPerDay;

        return remainder == 0 ? days : days + 1;
    }

    public static long getActivationGracePeriodDays() {
        return ACTIVATION_GRACE_PERIOD.toDays();
    }

    private static Optional<Instant> getGracePeriodEnd(User user) {
        if (user == null || user.getCreatedDate() == null) {
            return Optional.empty();
        }
        Instant effectiveCreatedDate = user.getCreatedDate().isBefore(ACTIVATION_GRACE_PERIOD_CREATED_DATE_FLOOR)
            ? ACTIVATION_GRACE_PERIOD_CREATED_DATE_FLOOR
            : user.getCreatedDate();
        return Optional.of(effectiveCreatedDate.plus(ACTIVATION_GRACE_PERIOD));
    }
}
