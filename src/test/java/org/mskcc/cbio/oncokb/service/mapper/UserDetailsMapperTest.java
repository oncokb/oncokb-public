package org.mskcc.cbio.oncokb.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;


public class UserDetailsMapperTest {

    private UserDetailsMapper userDetailsMapper;

    @BeforeEach
    public void setUp() {
        userDetailsMapper = new UserDetailsMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 2L;
        assertThat(userDetailsMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(userDetailsMapper.fromId(null)).isNull();
    }
}
