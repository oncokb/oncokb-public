package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

import java.util.HashMap;
import java.util.Map;

public class UsageSummary {
  private Map<String, Map<String, Long>> day = new HashMap<>();

  private Map<String, Map<String, Long>> month = new HashMap<>();

  private Map<String, Map<String, Long>> year = new HashMap<>();

  public Map<String, Map<String, Long>> getDay() {
    return day;
  }

  public void setDay(Map<String, Map<String, Long>> day) {
    this.day = day;
  }

  public Map<String, Map<String, Long>> getMonth() {
    return month;
  }

  public void setMonth(Map<String, Map<String, Long>> month) {
    this.month = month;
  }

  public Map<String, Map<String, Long>> getYear() {
    return year;
  }

  public void setYear(Map<String, Map<String, Long>> year) {
    this.year = year;
  }
}
