package org.mskcc.cbio.oncokb.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;


public class UserMailsMapperTest {

    private UserMailsMapper userMailsMapper;

    @BeforeEach
    public void setUp() {
        userMailsMapper = new UserMailsMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 2L;
        assertThat(userMailsMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(userMailsMapper.fromId(null)).isNull();
    }
}
