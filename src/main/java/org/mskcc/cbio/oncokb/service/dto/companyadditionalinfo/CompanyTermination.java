package org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo;

import java.io.Serializable;
import java.time.LocalDate;

public class CompanyTermination implements Serializable {
  private Integer notificationDays;
  private LocalDate date;
  private String notes;

  public Integer getNotificationDays() {
    return notificationDays;
  }

  public void setNotificationDays(Integer notificationDays) {
    this.notificationDays = notificationDays;
  }

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String note) {
    this.notes = note;
  }
}
