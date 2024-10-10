package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

public class UserStats {
  private String mostUsedEndpoint;
  private String mostUsedPublicEndpoint;
  private float maxUsageProportion;
  private float publicMaxUsageProportion;
  private long totalUsage;
  private long totalPublicUsage;

  public String getMostUsedEndpoint() {
    return mostUsedEndpoint;
  }

  public void setMostUsedEndpoint(String mostUsedEndpoint) {
    this.mostUsedEndpoint = mostUsedEndpoint;
  }

  public String getMostUsedPublicEndpoint() {
    return mostUsedPublicEndpoint;
  }

  public void setMostUsedPublicEndpoint(String mostUsedPublicEndpoint) {
    this.mostUsedPublicEndpoint = mostUsedPublicEndpoint;
  }

  public float getMaxUsageProportion() {
    return maxUsageProportion;
  }

  public void setMaxUsageProportion(float maxUsageProportion) {
    this.maxUsageProportion = maxUsageProportion;
  }

  public float getPublicMaxUsageProportion() {
    return publicMaxUsageProportion;
  }

  public void setPublicMaxUsageProportion(float publicMaxUsageProportion) {
    this.publicMaxUsageProportion = publicMaxUsageProportion;
  }

  public long getTotalUsage() {
    return totalUsage;
  }

  public void setTotalUsage(long totalUsage) {
    this.totalUsage = totalUsage;
  }

  public long getTotalPublicUsage() {
    return totalPublicUsage;
  }

  public void setTotalPublicUsage(long totalPublicUsage) {
    this.totalPublicUsage = totalPublicUsage;
  }
}
