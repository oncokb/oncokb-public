package org.mskcc.cbio.oncokb.service;

import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = OncokbPublicApp.class)
class SmartsheetServiceTest {


    @Autowired
    SmartsheetService smartsheetService;

    @Test
    void isUsa() {
        assertFalse(smartsheetService.isUsa(null));
        assertFalse(smartsheetService.isUsa(" "));
        assertFalse(smartsheetService.isUsa(""));
        assertFalse(smartsheetService.isUsa("Test"));

        assertTrue(smartsheetService.isUsa("US"));
        assertTrue(smartsheetService.isUsa(" US"));
        assertTrue(smartsheetService.isUsa("US "));
        assertTrue(smartsheetService.isUsa("USA"));
        assertTrue(smartsheetService.isUsa("United States"));
        assertTrue(smartsheetService.isUsa("United States of America"));
        assertTrue(smartsheetService.isUsa("U.S.A."));
        assertTrue(smartsheetService.isUsa("U.S.A"));
    }
}
