package org.mskcc.cbio.oncokb.domain.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum DeveloperNewsType {
    FEAT("feat"),
    FIX("fix"),
    CHORE("chore");

    private final String value;

    DeveloperNewsType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DeveloperNewsType fromValue(String value) {
        return Arrays.stream(values())
            .filter(type -> type.value.equals(value))
            .findFirst()
            .orElse(CHORE);
    }
}
