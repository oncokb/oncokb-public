package org.mskcc.cbio.oncokb.service.dto;

import java.time.Instant;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class LicenseAgreement {
    String name;
    String version;
    Instant acceptanceDate;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Instant getAcceptanceDate() {
        return acceptanceDate;
    }

    public void setAcceptanceDate(Instant acceptanceDate) {
        this.acceptanceDate = acceptanceDate;
    }
}
