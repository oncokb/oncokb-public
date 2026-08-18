package org.mskcc.cbio.oncokb.config.application;

import org.mskcc.cbio.oncokb.domain.enumeration.BulkEmailAudience;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class SendGridProperties {
    private boolean enabled = false;
    private String apiKey;
    private String baseUrl;
    private String newsTemplate;
    private String newsTemplateNoUnsubscribe;
    private BulkEmailTypesConfig bulkEmailTypes = new BulkEmailTypesConfig();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return StringUtils.removeEnd(StringUtils.defaultString(baseUrl).trim(), "/");
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public BulkEmailTypesConfig getBulkEmailTypes() {
        return bulkEmailTypes;
    }

    public void setBulkEmailTypes(BulkEmailTypesConfig bulkEmailTypes) {
        this.bulkEmailTypes = bulkEmailTypes;
    }

    public String getNewsTemplate() {
        return newsTemplate;
    }

    public void setNewsTemplate(String newsTemplate) {
        this.newsTemplate = newsTemplate;
    }

    public String getNewsTemplateNoUnsubscribe() {
        return newsTemplateNoUnsubscribe;
    }

    public void setNewsTemplateNoUnsubscribe(String newsTemplateNoUnsubscribe) {
        this.newsTemplateNoUnsubscribe = newsTemplateNoUnsubscribe;
    }

    public static class BulkEmailTypesConfig {
        private final BulkEmailTypeConfig custom = new BulkEmailTypeConfig(BulkEmailAudience.CUSTOM);
        private final BulkEmailTypeConfig allUsers = new BulkEmailTypeConfig(BulkEmailAudience.ALL_USERS);
        private final BulkEmailTypeConfig developers = new BulkEmailTypeConfig(BulkEmailAudience.DEVELOPERS);
        private final BulkEmailTypeConfig scientificNews = new BulkEmailTypeConfig(BulkEmailAudience.SCIENTIFIC_NEWS);

        public BulkEmailTypeConfig getCustom() {
            return custom;
        }

        public BulkEmailTypeConfig getAllUsers() {
            return allUsers;
        }

        public BulkEmailTypeConfig getDevelopers() {
            return developers;
        }

        public BulkEmailTypeConfig getScientificNews() {
            return scientificNews;
        }
    }

    public static class BulkEmailTypeConfig {
        private final BulkEmailAudience audience;
        private Long asmGroupId;

        public BulkEmailTypeConfig(BulkEmailAudience audience) {
            this.audience = audience;
        }

        public BulkEmailAudience getAudience() {
            return audience;
        }

        public Long getAsmGroupId() {
            return asmGroupId;
        }

        public void setAsmGroupId(Long asmGroupId) {
            this.asmGroupId = asmGroupId;
        }

    }
}
