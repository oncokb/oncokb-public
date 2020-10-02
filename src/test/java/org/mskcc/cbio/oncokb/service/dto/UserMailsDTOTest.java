package org.mskcc.cbio.oncokb.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.mskcc.cbio.oncokb.web.rest.TestUtil;

public class UserMailsDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserMailsDTO.class);
        UserMailsDTO userMailsDTO1 = new UserMailsDTO();
        userMailsDTO1.setId(1L);
        UserMailsDTO userMailsDTO2 = new UserMailsDTO();
        assertThat(userMailsDTO1).isNotEqualTo(userMailsDTO2);
        userMailsDTO2.setId(userMailsDTO1.getId());
        assertThat(userMailsDTO1).isEqualTo(userMailsDTO2);
        userMailsDTO2.setId(2L);
        assertThat(userMailsDTO1).isNotEqualTo(userMailsDTO2);
        userMailsDTO1.setId(null);
        assertThat(userMailsDTO1).isNotEqualTo(userMailsDTO2);
    }
}
