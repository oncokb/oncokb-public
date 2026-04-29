package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

public class UserRegistrationSummary {
  private String date;
  private Long total;
  private String licenseType;

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public Long getTotal() {
    return total;
  }

  public void setTotal(Long total) {
    this.total = total;
  }

  public String getLicenseType() {
    return licenseType;
  }

  public void setLicenseType(String licenseType) {
    this.licenseType = licenseType;
  }
}
