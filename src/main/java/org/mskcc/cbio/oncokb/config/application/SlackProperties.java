package org.mskcc.cbio.oncokb.config.application;

/**
 * Created by Benjamin Xu on 6/24/21.
 */
public class SlackProperties {
    String userRegistrationWebhook;
    String userRegistrationChannelId;
    String slackBotOauthToken;
    String slackBaseUrl;

    public String getUserRegistrationWebhook() {
        return userRegistrationWebhook;
    }

    public void setUserRegistrationWebhook(String userRegistrationWebhook) {
        this.userRegistrationWebhook = userRegistrationWebhook;
    }

    public String getUserRegistrationChannelId() {
        return userRegistrationChannelId;
    }

    public void setUserRegistrationChannelId(String userRegistrationChannelId) {
        this.userRegistrationChannelId = userRegistrationChannelId;
    }

    public String getSlackBotOauthToken() {
        return slackBotOauthToken;
    }

    public void setSlackBotOauthToken(String slackBotOauthToken) {
        this.slackBotOauthToken = slackBotOauthToken;
    }

    public String getSlackBaseUrl() {
        return slackBaseUrl;
    }

    public void setSlackBaseUrl(String slackBaseUrl) {
        this.slackBaseUrl = slackBaseUrl;
    }
}
