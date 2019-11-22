package org.mskcc.cbio.oncokb.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.mskcc.cbio.oncokb.web.rest.TestUtil;

public class UserDetailsDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserDetailsDTO.class);
        UserDetailsDTO userDetailsDTO1 = new UserDetailsDTO();
        userDetailsDTO1.setId(1L);
        UserDetailsDTO userDetailsDTO2 = new UserDetailsDTO();
        assertThat(userDetailsDTO1).isNotEqualTo(userDetailsDTO2);
        userDetailsDTO2.setId(userDetailsDTO1.getId());
        assertThat(userDetailsDTO1).isEqualTo(userDetailsDTO2);
        userDetailsDTO2.setId(2L);
        assertThat(userDetailsDTO1).isNotEqualTo(userDetailsDTO2);
        userDetailsDTO1.setId(null);
        assertThat(userDetailsDTO1).isNotEqualTo(userDetailsDTO2);
    }
}
