package org.mskcc.cbio.oncokb.service;

import com.smartsheet.api.Smartsheet;
import com.smartsheet.api.SmartsheetException;
import com.smartsheet.api.SmartsheetFactory;
import com.smartsheet.api.models.Cell;
import com.smartsheet.api.models.Row;
import com.smartsheet.api.models.SearchResult;
import com.smartsheet.api.models.Sheet;
import io.sentry.SentryLevel;
import io.sentry.protocol.User;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SmartsheetProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.UserCompany;
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

    private final int MIN_NUM_COLUMN = 8;

    private final SmartsheetProperties smartsheetProperties;
    private final SentryService sentryService;
    private Smartsheet smartsheet;

    public SmartsheetService(ApplicationProperties applicationProperties, SentryService sentryService) {
        this.smartsheetProperties = applicationProperties.getSmartsheet();
        this.sentryService = sentryService;
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
        @NotNull String userCountry,
        @NotNull LicenseType licenseType,
        @NotNull String useCase
    ) throws MessagingException {
        if (this.smartsheet != null
            && this.smartsheetProperties.getSheetId() != null
        ) {
            Sheet sheet = null;
            try {
                sheet = smartsheet.sheetResources().getSheet(
                    this.smartsheetProperties.getSheetId(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                );
            } catch (SmartsheetException e) {
                sentryService.throwEvent(SentryLevel.ERROR, e, "Failed to get smart sheet using smartsheet.sheetResources().getSheet");
                return;
            }
            if (sheet.getColumns().size() < MIN_NUM_COLUMN) {
                User user = new User();
                user.setUsername(userName);
                sentryService.throwMessage(SentryLevel.ERROR, "ROC Smartsheet number of columns is not expected, expect no less than " + MIN_NUM_COLUMN + " columns", user);
            } else {
                // Search user email to see whether email has been added. If the email exists, skip adding record
                // Enclose double quote for exact match. This is necessary, otherwise the fuzzy search is not so accurate.
                SearchResult searchResult = null;
                try {
                    searchResult = this.smartsheet.searchResources().search("\"" + userEmail + "\"");
                    if (searchResult.getTotalCount() > 0) {
                        log.info("The user " + userEmail + " already exists in the ROC smartsheet");
                        return;
                    }
                } catch (SmartsheetException e) {
                    sentryService.throwEvent(SentryLevel.WARNING, e, "Failed to search sheet with query " + userEmail + ". But we are going to try to insert the record anyway");
                }
            }

            // Specify cell values for first row
            List<Cell> rowACells = Arrays.asList(
                new Cell(this.smartsheetProperties.getColumnIds().get(0)).setValue(this.smartsheetProperties.getEditor()),
                new Cell(this.smartsheetProperties.getColumnIds().get(1)).setValue(userName),
                new Cell(this.smartsheetProperties.getColumnIds().get(2)).setValue(userEmail),
                new Cell(this.smartsheetProperties.getColumnIds().get(3)).setValue(userCompany),
                new Cell(this.smartsheetProperties.getColumnIds().get(4)).setValue(userCity),
                new Cell(this.smartsheetProperties.getColumnIds().get(5)).setValue(userCountry),
                new Cell(this.smartsheetProperties.getColumnIds().get(6)).setValue(licenseType),
                new Cell(this.smartsheetProperties.getColumnIds().get(7)).setValue(useCase)
            );

            // Specify contents of first row
            Row newRow = new Row();
            newRow.setCells(rowACells)
                .setToBottom(true);

            // Add rows to sheet
            try {
                List<Row> createdRows = smartsheet.sheetResources().rowResources().addRows(
                    this.smartsheetProperties.getSheetId(),
                    Collections.singletonList(newRow)
                );
            } catch (SmartsheetException e) {
                sentryService.throwEvent(SentryLevel.ERROR, e, "Failed to add row to smartsheet, " + newRow);
            }
        } else {
            log.warn("No user record is added since smartsheet is not initiated properly");
        }
    }

    public void addUserToSheet(UserDTO userDTO) throws MessagingException {
        // use user specified use case, otherwise use company description if available
        String useCase = Optional.ofNullable(userDTO.getAdditionalInfo()).map(AdditionalInfoDTO::getUserCompany).map(UserCompany::getUseCase).orElse("");
        if (StringUtils.isEmpty(useCase) && userDTO.getCompany() != null) {
            useCase = Optional.ofNullable(userDTO.getCompany().getDescription()).orElse("");
        }

        addUserToSheet(
            userDTO.getFirstName() + " " + userDTO.getLastName(),
            userDTO.getEmail(),
            Optional.ofNullable(userDTO.getCompanyName()).orElse(""),
            Optional.ofNullable(userDTO.getCity()).orElse(""),
            Optional.ofNullable(userDTO.getCountry()).orElse(""),
            userDTO.getLicenseType(),
            useCase
        );
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

    public boolean sentToRocReview(UserDTO userDTO) {
        return userDTO.getAdditionalInfo() != null && Boolean.TRUE.equals(userDTO.getAdditionalInfo().getSentToRocReview());
    }

    public boolean shouldAddUser(UserDTO userDTO) {
        if (sentToRocReview(userDTO)) {
            return false;
        }
        if (userDTO.getEmail().endsWith(MSK_EMAIL_DOMAIN)) {
            log.debug("User is not added to smartsheet since email is from MSK");
            return false;
        }
        if (LicenseType.COMMERCIAL.equals(userDTO.getLicenseType()) || LicenseType.RESEARCH_IN_COMMERCIAL.equals(userDTO.getLicenseType())) {
            // should always add user when it's for commercial
            return true;
        }
        if (isUsa(userDTO.getCountry())) {
            log.debug("User is not added to smartsheet since country is USA");
            return false;
        }
        return true;
    }

    public String getSendReviewalCriteria() {
        return "Only send for review based on either one of the following:\n" +
            " \n" +
            "a. Located in any of the following countries - Burma, Cambodia, Cuba, China (including Hong Kong and Macau), Iran, North Korea, Russia, Syria, Venezuela, or Belarus; or\n" +
            " \n" +
            "b. License type (i) Commercial, or (ii) Research in Commercial";
    }
}
