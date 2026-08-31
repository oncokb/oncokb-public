package org.mskcc.cbio.oncokb.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.domain.Token;

public class TokenUtilUnitTest {

    @Test
    public void isUserOnTrialReturnsFalseWhenAnyRenewableTokenExists() {
        Token renewableToken = createToken(true);
        Token nonRenewableToken = createToken(false);

        assertThat(TokenUtil.isUserOnTrial(Arrays.asList(nonRenewableToken, renewableToken))).isFalse();
    }

    @Test
    public void isUserOnTrialReturnsTrueWhenNoRenewableTokensExist() {
        Token nonRenewableToken1 = createToken(false);
        Token nonRenewableToken2 = createToken(false);

        assertThat(TokenUtil.isUserOnTrial(Arrays.asList(nonRenewableToken1, nonRenewableToken2))).isTrue();
    }

    @Test
    public void isUserOnTrialReturnsTrueForEmptyTokenList() {
        assertThat(TokenUtil.isUserOnTrial(Collections.emptyList())).isTrue();
    }

    private Token createToken(boolean renewable) {
        Token token = new Token();
        token.setRenewable(renewable);
        token.setExpiration(Instant.now().plusSeconds(3600));
        return token;
    }
}
