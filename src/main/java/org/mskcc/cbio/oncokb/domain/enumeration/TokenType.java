package org.mskcc.cbio.oncokb.domain.enumeration;

/**
 * The TokenType enumeration.
 */
public enum TokenType {
    PERSONAL("okbp") 
    // Not yet implemented
    , SERVICE("okbs")
    , WEB("okbw");

    String prefix;

    TokenType(String prefix) {
        this.prefix = prefix;
    }

    public String getPrefix() {
        return prefix;
    }

    public static TokenType getTokenTypeFromPrefix(String prefix) {
        for (TokenType type : TokenType.values()) {
            if (type.getPrefix().equals(prefix)) { 
                return type;
            }
        }
        return null;
    }
}