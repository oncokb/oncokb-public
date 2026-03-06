package org.mskcc.cbio.oncokb.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class GracePeriodBlackListServiceTest {

    private final GracePeriodBlackListService service = new GracePeriodBlackListService();

    @Test
    public void shouldSkipGracePeriodForCommonPersonalEmailDomain() {
        assertThat(service.shouldSkipGracePeriod("user@gmail.com")).isTrue();
        assertThat(service.shouldSkipGracePeriod("user@outlook.com")).isTrue();
    }

    @Test
    public void shouldNotSkipGracePeriodForInstitutionalEmailDomain() {
        assertThat(service.shouldSkipGracePeriod("user@mskcc.org")).isFalse();
    }
}
