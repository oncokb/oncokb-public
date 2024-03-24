package org.mskcc.cbio.oncokb.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String PREMIUM_USER = "ROLE_PREMIUM_USER";

    public static final String PUBLIC_WEBSITE = "ROLE_PUBLIC_WEBSITE";

    public static final String DATA_DOWNLOAD = "ROLE_DATA_DOWNLOAD";

    public static final String BOT = "ROLE_BOT";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String API = "ROLE_API";

    private AuthoritiesConstants() {
    }
}
