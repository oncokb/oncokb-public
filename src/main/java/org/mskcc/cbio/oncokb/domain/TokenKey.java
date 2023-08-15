package org.mskcc.cbio.oncokb.domain;

import java.util.Optional;
import java.util.UUID;
import java.util.zip.CRC32;

import org.mskcc.cbio.oncokb.domain.enumeration.TokenType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Object to store api key strings in manipulatable format.
 * 
 * Created by Benjamin Xu on 08/15/2023.
 */

public class TokenKey {

    private static final Logger log = LoggerFactory.getLogger(TokenKey.class);

    private TokenType type;
    private String randomString;
    private String checksum;

    private static final int PREFIX_LENGTH = 4;
    private static final int RANDOM_STRING_LENGTH = 32;
    private static final int CHECKSUM_LENGTH = 8;

    public static TokenKey randomKey(TokenType type) {
        TokenKey tokenKey = new TokenKey();
        tokenKey.setTokenType(type);
        tokenKey.setRandomString(UUID.randomUUID());
        return tokenKey;
    }

    public static Optional<TokenKey> fromString(String key) {
        String[] separatedKey = key.split("_");

        // Check that the input is in the right format
        if (separatedKey.length != 2
         || separatedKey[0].length() != PREFIX_LENGTH
         || separatedKey[1].length() != RANDOM_STRING_LENGTH + CHECKSUM_LENGTH) {
            log.warn("Attempted to generate TokenKey from invalid string.");
            return Optional.empty();
        }

        TokenType inputKeyType = TokenType.getTokenTypeFromPrefix(separatedKey[0]);
        
        // Check that the input prefix is valid
        if (inputKeyType == null) {
            log.warn("Attempted to generate TokenKey from invalid string (bad prefix).");
            return Optional.empty();
        }

        String inputRandomString = separatedKey[1].substring(0, 32);

        // Check that the input randomString satisfies character set
        if (!inputRandomString.matches("[0-9a-f]+")) {
            log.warn("Attempted to generate TokenKey from invalid string (bad randomString).");
            return Optional.empty();
        }

        String inputCheckSum = separatedKey[1].substring(32);

        // Check that the input checksum is valid
        if (!inputCheckSum.equals(calculateChecksum(inputRandomString))) {
            log.warn("Attempted to generate TokenKey from invalid string (bad checksum).");
            return Optional.empty();
        }

        TokenKey tokenKey = new TokenKey();
        tokenKey.setTokenType(inputKeyType);
        tokenKey.setRandomString(inputRandomString);
        return Optional.of(tokenKey);
    }

    public TokenType getTokenType() {
        return type;
    }

    public void setTokenType(TokenType type) {
        this.type = type;
    }

    public String getRandomString() {
        return randomString;
    }

    public void setRandomString(String randomString) {
        // Assert the string is 32 characters
        if (randomString == null || randomString.length() != 32) {
            log.warn("Attempted to modify TokenKey from invalid string. TokenKey modification skipped.");
            return;
        }
        this.randomString = randomString;

        // Set checksum
        setChecksum();
    }

    public void setRandomString(UUID uuid) {
        // Convert UUID to 32 character string
        randomString = uuid.toString().replace("-","");

        // Set checksum
        setChecksum();
    }

    private void setChecksum() {
        CRC32 crc32 = new CRC32();
        crc32.update(randomString.getBytes());
        checksum = String.format("%08x", crc32.getValue());
    }

    private static String calculateChecksum(String randomString) {
        CRC32 crc32 = new CRC32();
        crc32.update(randomString.getBytes());
        return String.format("%08x", crc32.getValue());
    }

    public String toString() {
        return type.getPrefix() + randomString + checksum;
    }
}
