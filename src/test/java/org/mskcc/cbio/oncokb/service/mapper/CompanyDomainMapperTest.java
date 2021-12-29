package org.mskcc.cbio.oncokb.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CompanyDomainMapperTest {

    private CompanyDomainMapper companyDomainMapper;

    @BeforeEach
    public void setUp() {
        companyDomainMapper = new CompanyDomainMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(companyDomainMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(companyDomainMapper.fromId(null)).isNull();
    }
}
