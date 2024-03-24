package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

import java.util.Map;

/**
 * Created by Yifu Yao on 2020-11-2
 */

public class UserOverviewUsage {
    private String userId;
    private String userEmail;
    private String endpoint;
    private String noPrivateEndpoint;
    private float maxUsageProportion;
    private float noPrivateMaxUsageProportion;
    private long totalUsage;
    private Map<String, Long> dayUsage;
    private Map<String, Long> monthUsage;

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

    public float getMaxUsageProportion() {
        return maxUsageProportion;
    }

    public void setMaxUsageProportion(float maxUsageProportion) {
        this.maxUsageProportion = maxUsageProportion;
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

    public float getNoPrivateMaxUsageProportion() {
        return noPrivateMaxUsageProportion;
    }

    public void setNoPrivateMaxUsageProportion(float noPrivateMaxUsageProportion) {
        this.noPrivateMaxUsageProportion = noPrivateMaxUsageProportion;
    }

    public Map<String, Long> getDayUsage() {
        return dayUsage;
    }

    public void setDayUsage(Map<String, Long> dayUsage) {
        this.dayUsage = dayUsage;
    }

    public Map<String, Long> getMonthUsage() {
        return monthUsage;
    }

    public void setMonthUsage(Map<String, Long> monthUsage) {
        this.monthUsage = monthUsage;
    }
}

