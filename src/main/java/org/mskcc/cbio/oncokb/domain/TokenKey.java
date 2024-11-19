package org.mskcc.cbio.oncokb.domain;

import java.io.Serializable;

import org.mskcc.cbio.oncokb.domain.enumeration.TokenType;

public class TokenKey implements Serializable {
    public static int TOKEN_CHAR_LENGTH = 30;

    public static int CHECKSUM_CHAR_LENGTH = 6;

    private TokenType tokenType;

    private String token;

    private String checksum;

    public TokenType getTokenType() {
        return tokenType;
    }

    public void setTokenType(TokenType tokenType) {
        this.tokenType = tokenType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }
}
