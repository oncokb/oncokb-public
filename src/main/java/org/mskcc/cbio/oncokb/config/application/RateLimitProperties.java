package org.mskcc.cbio.oncokb.config.application;

import org.springframework.boot.convert.DurationUnit;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

public class RateLimitProperties {
    private long capacity = 30L;

    @DurationUnit(ChronoUnit.SECONDS)
    private Duration refillPeriod = Duration.ofSeconds(5);

    public long getCapacity() {
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
