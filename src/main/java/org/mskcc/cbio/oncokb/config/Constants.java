package org.mskcc.cbio.oncokb.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    public static final String LOGIN_REGEX = "^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$";

    public static final String SYSTEM_ACCOUNT = "system";
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String ANONYMOUS_USER = "anonymoususer";

    public static final String MSK_EMAIL_DOMAIN = "mskcc.org";

    public static final String MAIL_LICENSE = "license";

    public static final String PUBLIC_WEBSITE_LOGIN = "publicwebsite";

    public static final int DAY_IN_SECONDS = 60 * 60 * 24;
    public static final int HALF_YEAR_IN_SECONDS = DAY_IN_SECONDS * 180;
    private Constants() {
    }
}
