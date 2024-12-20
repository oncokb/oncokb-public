package org.mskcc.cbio.oncokb.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.ByteBuffer;

import org.apache.commons.lang3.StringUtils;
import org.junit.Test;

public class TokenKeyTest {
    @Test
    public void toBase62() {
        String test = "d";
        assertThat(TokenKey.toBase62(stringToLong(test))).isEqualTo("1c");

        test = "hello";
        assertThat(TokenKey.toBase62(stringToLong(test))).isEqualTo("7tQLFHz");

        test = "oncokb";
        assertThat(TokenKey.toBase62(122519905332066L)).isEqualTo("Yn1xclvu");
    }

    private long stringToLong(String str) {
        if (str.length() < Long.BYTES) {
            str = StringUtils.repeat('\0', Long.BYTES - str.length()) + str;
        }

        ByteBuffer buffer = ByteBuffer.wrap(str.getBytes());
        return buffer.getLong(0);
    }
}
