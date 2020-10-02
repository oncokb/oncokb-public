package org.mskcc.cbio.oncokb.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.mskcc.cbio.oncokb.web.rest.TestUtil;

public class UserMailsTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserMails.class);
        UserMails userMails1 = new UserMails();
        userMails1.setId(1L);
        UserMails userMails2 = new UserMails();
        userMails2.setId(userMails1.getId());
        assertThat(userMails1).isEqualTo(userMails2);
        userMails2.setId(2L);
        assertThat(userMails1).isNotEqualTo(userMails2);
        userMails1.setId(null);
        assertThat(userMails1).isNotEqualTo(userMails2);
    }
}
