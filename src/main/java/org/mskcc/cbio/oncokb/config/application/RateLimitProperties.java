package org.mskcc.cbio.oncokb.config.application;

import org.springframework.boot.convert.DurationUnit;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

public class RateLimitProperties {
    private Long capacity;

    @DurationUnit(ChronoUnit.SECONDS)
    private Duration refillPeriod;

    public Long getCapacity() {
        return capacity;
    }

    public void setCapacity(long capacity) {
        this.capacity = capacity;
    }

    public Duration getRefillPeriod() {
        return refillPeriod;
    }

    public void setRefillPeriod(Duration refillPeriod) {
        this.refillPeriod = refillPeriod;
    }
}
