package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

/**
 * Created by Yifu Yao on 2020-11-2
 */

public class UserOverviewUsage {
    private String userId;
    private String userEmail;
    private String endpoint;
    private String noPrivateEndpoint;
    private long maxUsage;
    private long noPrivateMaxUsage;
    private long totalUsage;

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public long getMaxUsage() {
        return maxUsage;
    }

    public void setMaxUsage(long maxUsage) {
        this.maxUsage = maxUsage;
    }

    public long getTotalUsage() {
        return totalUsage;
    }

    public void setTotalUsage(long totalUsage) {
        this.totalUsage = totalUsage;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNoPrivateEndpoint() {
        return noPrivateEndpoint;
    }

    public void setNoPrivateEndpoint(String noPrivateEndpoint) {
        this.noPrivateEndpoint = noPrivateEndpoint;
    }

    public long getNoPrivateMaxUsage() {
        return noPrivateMaxUsage;
    }

    public void setNoPrivateMaxUsage(long noPrivateMaxUsage) {
        this.noPrivateMaxUsage = noPrivateMaxUsage;
    }
}

