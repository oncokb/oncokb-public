package org.mskcc.cbio.oncokb.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    // we use user email as login
    // the updated regex seems having issue to be used: ^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$
    public static final String LOGIN_REGEX = "^[_.@A-Za-z0-9-]*$";

    public static final String SYSTEM_ACCOUNT = "system";
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String ANONYMOUS_USER = "anonymoususer";

    public static final String MSK_EMAIL_DOMAIN = "mskcc.org";

    public static final String MAIL_LICENSE = "license";

    public static final String PUBLIC_WEBSITE_LOGIN = "publicwebsite";

    public static final String EXPIRATION = "expiration";

    public static final int DAY_IN_SECONDS = 60 * 60 * 24;
    public static final int HALF_YEAR_IN_SECONDS = DAY_IN_SECONDS * 180;

    public static final int RESET_TOKEN_VALID_SEC_FROM_CREATION = DAY_IN_SECONDS * 7;

    public static final int TRIAL_PERIOD_IN_DAYS = 90;

    public static final String USERS_USAGE_SUMMARY_FILE_PREFIX = "public-website/usage-analysis/year-user-summary_";
    public static final String RESOURCES_USAGE_SUMMARY_FILE_PREFIX = "public-website/usage-analysis/year-resource-summary_";
    public static final String RESOURCES_USAGE_DETAIL_FILE_PREFIX = "public-website/usage-analysis/year-resource-detail_";
    public static final String TOKEN_STATS_STORAGE_FILE_PREFIX = "public-website/token-usage/token-stats_";

    public static final String ONCOKB_TM = "OncoKB™";

    private Constants() {
    }
}
