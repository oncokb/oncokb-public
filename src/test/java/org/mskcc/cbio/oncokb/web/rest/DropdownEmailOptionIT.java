package org.mskcc.cbio.oncokb.web.rest;

import org.junit.Test;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.domain.enumeration.slack.DropdownEmailCategory;
import org.mskcc.cbio.oncokb.web.rest.slack.DropdownEmailOption;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

/*
 * Ensures all DropdownMenuOption enums are correctly defined.
 */

public class DropdownEmailOptionIT {

    @Test
    public void requiredPropertiesPopulated() {
        for (DropdownEmailOption option : DropdownEmailOption.values()) {
            assertThat(option.getBlockId()).isNotNull();
            assertThat(option.getActionId()).isNotNull();
            assertThat(option.getMailType()).isNotNull();
            assertThat(option.getCategory()).isNotNull();
            assertThat(option.getDropdownKey()).isNotBlank();
            assertThat(option.getExpandedNote()).isNotBlank();

            // Conditional requirements
            if (!option.isNotModalEmail()) {
                assertThat(option.getConfirmActionId()).isNotNull();
                assertThat(option.getModalTitle()).isNotEmpty();
                assertThat(option.getModalTitle().get()).isNotBlank();
            }
            if (option.getCategory() == DropdownEmailCategory.CLARIFY
             || option.getCategory() == DropdownEmailCategory.LICENSE
             || option.getCategory() == DropdownEmailCategory.DENY) {
                assertThat(option.getCollapsedNote()).isNotEmpty();
                assertThat(option.getCollapsedNote().get()).isNotBlank();
            }
        }
    }
}
