package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

public class UsageAnalysisRow {
  private String userId;
  private String userEmail;
  private Long resourceId;
  private String resource;
  private Long usage;
  private String time;
  private Float maxUsageProportion;

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getUserEmail() {
    return userEmail;
  }

  public void setUserEmail(String userEmail) {
    this.userEmail = userEmail;
  }

  public String getResource() {
    return resource;
  }

  public Long getResourceId() {
    return resourceId;
  }

  public void setResourceId(Long resourceId) {
    this.resourceId = resourceId;
  }

  public void setResource(String resource) {
    this.resource = resource;
  }

  public Long getUsage() {
    return usage;
  }

  public void setUsage(Long usage) {
    this.usage = usage;
  }

  public String getTime() {
    return time;
  }

  public void setTime(String time) {
    this.time = time;
  }

  public Float getMaxUsageProportion() {
    return maxUsageProportion;
  }

  public void setMaxUsageProportion(Float maxUsageProportion) {
    this.maxUsageProportion = maxUsageProportion;
  }
}
