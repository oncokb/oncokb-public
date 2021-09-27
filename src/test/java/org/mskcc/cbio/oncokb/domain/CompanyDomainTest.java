package org.mskcc.cbio.oncokb.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.mskcc.cbio.oncokb.web.rest.TestUtil;

public class CompanyDomainTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CompanyDomain.class);
        CompanyDomain companyDomain1 = new CompanyDomain();
        companyDomain1.setId(1L);
        CompanyDomain companyDomain2 = new CompanyDomain();
        companyDomain2.setId(companyDomain1.getId());
        assertThat(companyDomain1).isEqualTo(companyDomain2);
        companyDomain2.setId(2L);
        assertThat(companyDomain1).isNotEqualTo(companyDomain2);
        companyDomain1.setId(null);
        assertThat(companyDomain1).isNotEqualTo(companyDomain2);
    }
}
