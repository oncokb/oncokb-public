package org.mskcc.cbio.oncokb.util;

import java.util.List;
import org.mskcc.cbio.oncokb.domain.Token;

public class TokenUtil {
    private TokenUtil() {
    }

    public static boolean isUserOnTrial(List<Token> tokens) {
        return !tokens.stream().anyMatch(Token::isRenewable);
    }
}
