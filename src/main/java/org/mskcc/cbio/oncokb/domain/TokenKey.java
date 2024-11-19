package org.mskcc.cbio.oncokb.domain;

import java.io.Serializable;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.zip.CRC32;

import org.mskcc.cbio.oncokb.domain.enumeration.TokenType;

import io.seruco.encoding.base62.Base62;

public class TokenKey implements Serializable {
    public static int TOKEN_CHAR_LENGTH = 30;

    public static int CHECKSUM_CHAR_LENGTH = 6;

    private TokenType tokenType;

    private String token;

    private String checksum;

    public static TokenKey generate(TokenType type) {
        TokenKey tokenKey = new TokenKey();
        tokenKey.setTokenType(type);
        
        Base62 base62 = Base62.createInstance();
        SecureRandom secureRandom = new SecureRandom();

        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        String token = new String(base62.encode(bytes));
        tokenKey.setToken(token);

        CRC32 crc32 = new CRC32();
        crc32.update(bytes);
        ByteBuffer buffer = ByteBuffer.allocate(Long.BYTES);
        buffer.putLong(crc32.getValue());
        String checksum = new String(base62.encode(buffer.array()));
        tokenKey.setChecksum(checksum.substring(checksum.length() - TokenKey.CHECKSUM_CHAR_LENGTH));

        return tokenKey;
    }

    public boolean validateChecksum() {
        return false;
    }

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
