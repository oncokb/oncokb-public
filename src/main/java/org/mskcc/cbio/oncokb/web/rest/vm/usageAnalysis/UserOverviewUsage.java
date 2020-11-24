package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

/**
 * Created by Yifu Yao on 2020-11-2
 */

public class UserOverviewUsage {
    private String userId;
    private String userEmail;
    private String endpoint;
    private String noPrivateEndpoint;
    private int maxUsage;
    private int noPrivateMaxUsage;
    private int totalUsage;

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

    public int getMaxUsage() {
        return maxUsage;
    }

    public void setMaxUsage(int maxUsage) {
        this.maxUsage = maxUsage;
    }

    public int getTotalUsage() {
        return totalUsage;
    }

    public void setTotalUsage(int totalUsage) {
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

    public int getNoPrivateMaxUsage() {
        return noPrivateMaxUsage;
    }

    public void setNoPrivateMaxUsage(int noPrivateMaxUsage) {
        this.noPrivateMaxUsage = noPrivateMaxUsage;
    }
}

