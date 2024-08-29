package org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo;

import java.io.Serializable;
import java.time.LocalDate;

public class CompanyLicense implements Serializable {
  private LocalDate activation;
  private boolean autoRenewal;
  private CompanyTermination termination;

  public LocalDate getActivation() {
    return activation;
  }

  public void setActivation(LocalDate activation) {
    this.activation = activation;
  }

  public boolean isAutoRenewal() {
    return autoRenewal;
  }

  public void setAutoRenewal(boolean autoRenewal) {
    this.autoRenewal = autoRenewal;
  }

  public CompanyTermination getTermination() {
    return termination;
  }

  public void setTermination(CompanyTermination termination) {
    this.termination = termination;
  }
}
