package org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo;

import java.io.Serializable;

public class CompanyAdditionalInfoDTO implements Serializable {
  private CompanyLicense license;

  public CompanyLicense getLicense() {
    return license;
  }

  public void setLicense(CompanyLicense license) {
    this.license = license;
  }
}
