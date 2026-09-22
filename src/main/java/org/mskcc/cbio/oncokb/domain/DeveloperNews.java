package org.mskcc.cbio.oncokb.domain;

import java.util.List;

import org.mskcc.cbio.oncokb.domain.enumeration.DeveloperNewsType;

public class DeveloperNews {
    private String name;
    private String publishedAt;
    private List<DeveloperPullRequest> pullRequests;

    public DeveloperNews() {
    }

    public DeveloperNews(String name, String publishedAt, List<DeveloperPullRequest> pullRequests) {
        this.name = name;
        this.publishedAt = publishedAt;
        this.pullRequests = pullRequests;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(String publishedAt) {
        this.publishedAt = publishedAt;
    }

    public List<DeveloperPullRequest> getPullRequests() {
        return pullRequests;
    }

    public void setPullRequests(List<DeveloperPullRequest> pullRequests) {
        this.pullRequests = pullRequests;
    }

    public static class DeveloperPullRequest {
        private String name;
        private String url;
        private DeveloperNewsType type;

        public DeveloperPullRequest() {
        }

        public DeveloperPullRequest(String name, String url, DeveloperNewsType type) {
            this.name = name;
            this.url = url;
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public DeveloperNewsType getType() {
            return type;
        }

        public void setType(DeveloperNewsType type) {
            this.type = type;
        }
    }
}
