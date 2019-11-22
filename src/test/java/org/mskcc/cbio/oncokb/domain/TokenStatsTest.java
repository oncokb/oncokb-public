package org.mskcc.cbio.oncokb.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.mskcc.cbio.oncokb.web.rest.TestUtil;

public class TokenStatsTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TokenStats.class);
        TokenStats tokenStats1 = new TokenStats();
        tokenStats1.setId(1L);
        TokenStats tokenStats2 = new TokenStats();
        tokenStats2.setId(tokenStats1.getId());
        assertThat(tokenStats1).isEqualTo(tokenStats2);
        tokenStats2.setId(2L);
        assertThat(tokenStats1).isNotEqualTo(tokenStats2);
        tokenStats1.setId(null);
        assertThat(tokenStats1).isNotEqualTo(tokenStats2);
    }
}
