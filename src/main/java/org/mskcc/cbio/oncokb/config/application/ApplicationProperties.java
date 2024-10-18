package org.mskcc.cbio.oncokb.config.application;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.domain.enumeration.ProjectProfile;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.mskcc.oncokb.meta.model.application.AWSProperties;
import org.mskcc.oncokb.meta.model.application.RedisProperties;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Properties specific to Oncokb.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {
    private String name;
    private String baseUrl = "";
    private String apiProxyUrl;
    private SlackProperties slack;
    private ProjectProfile profile;
    private Boolean sitemapEnabled;
    private RedisProperties redis;
    private String academicEmailClarifyDomain;
    private String googleWebmasterVerification;
    private EmailAddresses emailAddresses;
    private String tokenUsageCheck;
    private String tokenUsageCheckWhitelist;
    private int publicWebsiteApiThreshold;
    private FrontendProperties frontend;
    private SamlAwsProperties samlAws;
    private String githubToken;
    private Boolean dbReadOnly;
    private RecaptchaProperties recaptcha;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiProxyUrl() {
        return apiProxyUrl;
    }

    public void setApiProxyUrl(String apiProxyUrl) {
        this.apiProxyUrl = apiProxyUrl;
    }

    public SlackProperties getSlack() { return slack; }

    public void setSlack( SlackProperties slack ) { this.slack = slack; }

    public String getAcademicEmailClarifyDomain() {
        return academicEmailClarifyDomain;
    }

    public void setAcademicEmailClarifyDomain(String academicEmailClarifyDomain) {
        this.academicEmailClarifyDomain = academicEmailClarifyDomain;
    }

    public ProjectProfile getProfile() {
        return profile;
    }

    public void setProfile(ProjectProfile profile) {
        this.profile = profile;
    }

    public Boolean getSitemapEnabled() {
        return sitemapEnabled;
    }

    public void setSitemapEnabled(Boolean sitemapEnabled) {
        this.sitemapEnabled = sitemapEnabled;
    }

    public RedisProperties getRedis() {
        return redis;
    }

    public void setRedis(RedisProperties redis) {
        this.redis = redis;
    }

    public String getGoogleWebmasterVerification() {
        return googleWebmasterVerification;
    }

    public void setGoogleWebmasterVerification(String googleWebmasterVerification) {
        this.googleWebmasterVerification = googleWebmasterVerification;
    }

    public EmailAddresses getEmailAddresses() {
        return emailAddresses;
    }

    public void setEmailAddresses(EmailAddresses emailAddresses) {
        this.emailAddresses = emailAddresses;
    }

    public String getTokenUsageCheck() {
        return tokenUsageCheck;
    }

    public void setTokenUsageCheck(String tokenUsageCheck) {
        this.tokenUsageCheck = tokenUsageCheck;
    }

    public String getTokenUsageCheckWhitelist() {
        return tokenUsageCheckWhitelist;
    }

    public void setTokenUsageCheckWhitelist(String tokenUsageCheckWhitelist) {
        this.tokenUsageCheckWhitelist = tokenUsageCheckWhitelist;
    }

    public int getPublicWebsiteApiThreshold() {
        return publicWebsiteApiThreshold;
    }

    public void setPublicWebsiteApiThreshold(int publicWebsiteApiThreshold) {
        this.publicWebsiteApiThreshold = publicWebsiteApiThreshold;
    }

    public FrontendProperties getFrontend() {
        return frontend;
    }

    public void setFrontend(FrontendProperties frontend) {
        this.frontend = frontend;
    }

    public List<String> getAcademicEmailClarifyDomains() {
        return getList(this.getAcademicEmailClarifyDomain());
    }

    private List<String> getList(String listStr) {
        if (StringUtils.isEmpty(listStr)) {
            return new ArrayList<>();
        }
        return Arrays.stream(listStr.split(",")).map(element -> element.trim()).filter(element -> !StringUtils.isEmpty(element)).collect(Collectors.toList());
    }

    public SamlAwsProperties getSamlAws() {
        return this.samlAws;
    }

    public void setSamlAws(SamlAwsProperties samlAws) {
        this.samlAws = samlAws;
    }

    public String getGithubToken() {
        return githubToken;
    }

    public void setGithubToken(String githubToken) {
        this.githubToken = githubToken;
    }

    public Boolean getDbReadOnly() {
        return this.dbReadOnly;
    }

    public void setDbReadOnly(Boolean dbReadOnly) {
        this.dbReadOnly = dbReadOnly;
    }

    public RecaptchaProperties getRecaptcha() {
        return recaptcha;
    }

    public void setRecaptcha(RecaptchaProperties recaptcha) {
        this.recaptcha = recaptcha;
    }

}
