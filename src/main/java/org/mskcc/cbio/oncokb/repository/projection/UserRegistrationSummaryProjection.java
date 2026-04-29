package org.mskcc.cbio.oncokb.repository.projection;

import java.time.LocalDate;

public interface UserRegistrationSummaryProjection {
  LocalDate getDate();

  Long getTotal();

  String getLicenseType();
}
