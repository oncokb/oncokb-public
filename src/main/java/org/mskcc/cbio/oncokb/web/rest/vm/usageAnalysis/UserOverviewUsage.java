package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

import java.util.Map;

public class UserOverviewUsage {
  private String userId;
  private String userEmail;
  private Map<String, UserStats> dayUsage;
  private Map<String, UserStats> monthUsage;
  private Map<String, UserStats> yearUsage;

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

  public Map<String, UserStats> getDayUsage() {
    return dayUsage;
  }

  public void setDayUsage(Map<String, UserStats> dayUsage) {
    this.dayUsage = dayUsage;
  }

  public Map<String, UserStats> getMonthUsage() {
    return monthUsage;
  }

  public void setMonthUsage(Map<String, UserStats> monthUsage) {
    this.monthUsage = monthUsage;
  }

  public Map<String, UserStats> getYearUsage() {
    return yearUsage;
  }

  public void setYearUsage(Map<String, UserStats> yearUsage) {
    this.yearUsage = yearUsage;
  }
}
