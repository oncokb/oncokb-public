package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

public class ResourceUsageAnalysisRow {
  private Long userId;
  private String userEmail;
  private String userFirstName;
  private String userLastName;
  private String licenseType;
  private String jobTitle;
  private String company;
  private Long resourceId;
  private String resource;
  private Long usage;
  private String time;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public String getUserEmail() {
    return userEmail;
  }

  public void setUserEmail(String userEmail) {
    this.userEmail = userEmail;
  }

  public String getUserFirstName() {
    return userFirstName;
  }

  public void setUserFirstName(String userFirstName) {
    this.userFirstName = userFirstName;
  }

  public String getUserLastName() {
    return userLastName;
  }

  public void setUserLastName(String userLastName) {
    this.userLastName = userLastName;
  }

  public String getLicenseType() {
    return licenseType;
  }

  public void setLicenseType(String licenseType) {
    this.licenseType = licenseType;
  }

  public String getJobTitle() {
    return jobTitle;
  }

  public void setJobTitle(String jobTitle) {
    this.jobTitle = jobTitle;
  }

  public String getCompany() {
    return company;
  }

  public void setCompany(String company) {
    this.company = company;
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
}
