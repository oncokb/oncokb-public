package org.mskcc.cbio.oncokb.service.dto;

import java.time.Instant;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class Activation {
    Instant initiationDate;
    Instant activationDate;
    String key;

    public Instant getInitiationDate() {
        return initiationDate;
    }

    public void setInitiationDate(Instant initiationDate) {
        this.initiationDate = initiationDate;
    }

    public Instant getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(Instant activationDate) {
        this.activationDate = activationDate;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
