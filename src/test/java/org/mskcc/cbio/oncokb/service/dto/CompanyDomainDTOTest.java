package org.mskcc.cbio.oncokb.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.mskcc.cbio.oncokb.web.rest.TestUtil;

public class CompanyDomainDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CompanyDomainDTO.class);
        CompanyDomainDTO companyDomainDTO1 = new CompanyDomainDTO();
        companyDomainDTO1.setId(1L);
        CompanyDomainDTO companyDomainDTO2 = new CompanyDomainDTO();
        assertThat(companyDomainDTO1).isNotEqualTo(companyDomainDTO2);
        companyDomainDTO2.setId(companyDomainDTO1.getId());
        assertThat(companyDomainDTO1).isEqualTo(companyDomainDTO2);
        companyDomainDTO2.setId(2L);
        assertThat(companyDomainDTO1).isNotEqualTo(companyDomainDTO2);
        companyDomainDTO1.setId(null);
        assertThat(companyDomainDTO1).isNotEqualTo(companyDomainDTO2);
    }
}
