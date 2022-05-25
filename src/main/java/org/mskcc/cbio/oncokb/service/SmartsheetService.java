package org.mskcc.cbio.oncokb.service;

import com.smartsheet.api.Smartsheet;
import com.smartsheet.api.SmartsheetException;
import com.smartsheet.api.SmartsheetFactory;
import com.smartsheet.api.models.Cell;
import com.smartsheet.api.models.Row;
import com.smartsheet.api.models.SearchResult;
import com.smartsheet.api.models.Sheet;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SmartsheetProperties;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mskcc.cbio.oncokb.config.Constants.MSK_EMAIL_DOMAIN;

@Service
public class SmartsheetService {
    private final Logger log = LoggerFactory.getLogger(SmartsheetService.class);

    private final int MIN_NUM_COLUMN = 6;

    private final MailService mailService;
    private final SlackService slackService;
    private final SmartsheetProperties smartsheetProperties;
    private Smartsheet smartsheet;

    public SmartsheetService(MailService mailService, SlackService slackService, ApplicationProperties applicationProperties) {
        this.smartsheetProperties = applicationProperties.getSmartsheet();
        this.mailService = mailService;
        this.slackService = slackService;
        if (this.smartsheetProperties != null && StringUtils.isNotEmpty(this.smartsheetProperties.getAccessToken())) {
            this.smartsheet = SmartsheetFactory.createDefaultClient(this.smartsheetProperties.getAccessToken());
        } else {
            log.info("Smartsheet is not initiated due to lack of access token");
        }
    }


    public void addUserToSheet(
        @NotEmpty String userName,
        @NotEmpty String userEmail,
        @NotNull String userCompany,
        @NotNull String userCity,
        @NotNull String userCountry
    ) throws MessagingException {
        if (this.smartsheet != null
            && this.smartsheetProperties.getSheetId() != null
            && this.smartsheetProperties.getColumnIds().size() == MIN_NUM_COLUMN
        ) {
            try {
                Sheet sheet = smartsheet.sheetResources().getSheet(
                    this.smartsheetProperties.getSheetId(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                if (sheet.getColumns().size() < MIN_NUM_COLUMN) {
                    mailService.sendEmailToDevTeam(
                        "ROC Smartsheet number of columns is not expected, expect no less than " + MIN_NUM_COLUMN + " columns",
                        "Please take a look at the sheet, it's supposed to have at least six columns",
                        null,
                        false,
                        false
                    );
                } else {
                    // Search user email to see whether email has been added. If the email exists, skip adding record
                    // Enclose double quote for exact match. This is necessary, otherwise the fuzzy search is not so accurate.
                    SearchResult searchResult = this.smartsheet.searchResources().search("\"" + userEmail + "\"");
                    if (searchResult.getTotalCount() > 0) {
                        log.info("The user " + userEmail + " already exists in the ROC smartsheet");
                        return;
                    }

                    // Specify cell values for first row
                    List<Cell> rowACells = Arrays.asList(
                        new Cell(this.smartsheetProperties.getColumnIds().get(0)).setValue(this.smartsheetProperties.getEditor()),
                        new Cell(this.smartsheetProperties.getColumnIds().get(1)).setValue(userName),
                        new Cell(this.smartsheetProperties.getColumnIds().get(2)).setValue(userEmail),
                        new Cell(this.smartsheetProperties.getColumnIds().get(3)).setValue(userCompany),
                        new Cell(this.smartsheetProperties.getColumnIds().get(4)).setValue(userCity),
                        new Cell(this.smartsheetProperties.getColumnIds().get(5)).setValue(userCountry)
                    );

                    // Specify contents of first row
                    Row newRow = new Row();
                    newRow.setCells(rowACells)
                        .setToBottom(true);

                    // Add rows to sheet
                    List<Row> createdRows = smartsheet.sheetResources().rowResources().addRows(
                        this.smartsheetProperties.getSheetId(),
                        Collections.singletonList(newRow)
                    );
                }
            } catch (SmartsheetException e) {
                mailService.sendEmailToDevTeam(
                    "Critical: Operation to ROC smartsheet failed",
                    "Please verify the ROC smartsheet is setup properly. The error: " + e.getMessage(),
                    null,
                    false,
                    false
                );
            }
        } else {
            log.warn("No user record is added since smartsheet is not initiated properly");
        }
    }

    public void addUserToSheetIfShould(UserDTO userDTO) {
        if (shouldAddUser(userDTO)) {
            try {
                addUserToSheet(userDTO.getFirstName() + " " + userDTO.getLastName(), userDTO.getEmail(), Optional.ofNullable(userDTO.getCompanyName()).orElse(""), Optional.ofNullable(userDTO.getCity()).orElse(""), Optional.ofNullable(userDTO.getCountry()).orElse(""));
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }

    public boolean isUsa(String country) {
        if (StringUtils.isEmpty(country)) {
            return false;
        }
        // to deal with name with abbreviation such as "U.S.A", with space
        String ct = country.trim().replace(".", "");
        String[] usaCountryNames = {"United States", "USA", "United States of America", "US"};
        return Arrays.asList(usaCountryNames).stream().filter(str -> str.equalsIgnoreCase(ct)).findAny().isPresent();
    }

    public boolean shouldAddUser(UserDTO userDTO) {
        boolean withNote = this.slackService.withAcademicClarificationNote(userDTO, null);
        if (withNote) {
            log.debug("User is not added to smartsheet since academic clarification note is present");
            return false;
        }

        if (userDTO.getEmail().endsWith(MSK_EMAIL_DOMAIN)) {
            log.debug("User is not added to smartsheet since email is from MSK");
            return false;
        }
        if (isUsa(userDTO.getCountry())) {
            log.debug("User is not added to smartsheet since country is USA");
            return false;
        }
        return true;
    }
}
