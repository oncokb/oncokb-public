package org.mskcc.cbio.oncokb.config.application;

/**
 * Created by Benjamin Xu on 6/24/21.
 */
public class SlackProperties {
    String userRegistrationWebhook;
    String userRegistrationChannelID;
    String slackBotOAuthToken;
    String slackBaseURL;

    public String getUserRegistrationWebhook() {
        return userRegistrationWebhook;
    }

    public void setUserRegistrationWebhook(String userRegistrationWebhook) {
        this.userRegistrationWebhook = userRegistrationWebhook;
    }

    public String getUserRegistrationChannelID() {
        return userRegistrationChannelID;
    }

    public void setUserRegistrationChannelID(String userRegistrationChannelID) {
        this.userRegistrationChannelID = userRegistrationChannelID;
    }

    public String getSlackBotOAuthToken() {
        return slackBotOAuthToken;
    }

    public void setSlackBotOAuthToken(String slackBotOAuthToken) {
        this.slackBotOAuthToken = slackBotOAuthToken;
    }

    public String getSlackBaseURL() {
        return slackBaseURL;
    }

    public void setSlackBaseURL(String slackBaseURL) {
        this.slackBaseURL = slackBaseURL;
    }
}
