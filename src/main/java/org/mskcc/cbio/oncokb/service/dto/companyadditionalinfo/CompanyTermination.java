package org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo;

import java.io.Serializable;
import java.time.Instant;

public class CompanyTermination implements Serializable {
  private Integer notificationDays;
  private Instant date;
  private String notes;
  private Boolean hasBeenNotified;

  public Integer getNotificationDays() {
    return notificationDays;
  }

  public void setNotificationDays(Integer notificationDays) {
    this.notificationDays = notificationDays;
  }

  public Instant getDate() {
    return date;
  }

  public void setDate(Instant date) {
    this.date = date;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String note) {
    this.notes = note;
  }

  public Boolean getHasBeenNotified() {
    return hasBeenNotified;
  }

  public void setHasBeenNotified(Boolean hasBeenNotified) {
    this.hasBeenNotified = hasBeenNotified;
  }
}
