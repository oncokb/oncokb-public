package org.mskcc.cbio.oncokb.service;

import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.model.block.ActionsBlock;
import com.slack.api.model.block.DividerBlock;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.*;
import com.slack.api.model.block.element.BlockElement;
import com.slack.api.model.block.element.ButtonElement;
import com.slack.api.model.block.element.StaticSelectElement;
import com.slack.api.webhook.Payload;
import com.slack.api.webhook.WebhookResponse;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.domain.enumeration.ProjectProfile;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static org.mskcc.cbio.oncokb.config.Constants.*;
import static org.mskcc.cbio.oncokb.util.MainUtil.isMSKUser;
import static org.mskcc.cbio.oncokb.util.StringUtil.getEmailDomain;
import static org.mskcc.cbio.oncokb.util.TimeUtil.toNYZoneTime;
import static org.mskcc.cbio.oncokb.web.rest.slack.ActionId.*;


/**
 * Service for sending account approval info to slack.
 * <p>
 * We use the {@link Async} annotation to send slack messages asynchronously.
 */
@Service
public class SlackService {

    private final Logger log = LoggerFactory.getLogger(SlackService.class);

    private final String VALUE_SEPARATOR = "-";
    private final ApplicationProperties applicationProperties;
    private final MailService mailService;
    private final EmailService emailService;

    public SlackService(ApplicationProperties applicationProperties, MailService mailService, EmailService emailService) {
        this.applicationProperties = applicationProperties;
        this.mailService = mailService;
        this.emailService = emailService;
    }

    @Async
    public void sendUserRegistrationToChannel(UserDTO user, boolean isTrialAccount, boolean trialAccountInitiated) {
        log.debug("Sending notification to admin group that a user has registered a new account");
        if (StringUtils.isEmpty(this.applicationProperties.getUserRegistrationWebhook())) {
            log.debug("\tSkipped, the webhook is not configured");
        } else {
            List<LayoutBlock> layoutBlocks = this.buildBlocks(user, isTrialAccount, trialAccountInitiated);
            this.sendBlocks(this.applicationProperties.getUserRegistrationWebhook(), layoutBlocks);
        }
    }

    @Async
    public void sendLatestBlocks(String url, UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated) {
        this.sendBlocks(url, this.buildBlocks(userDTO, isTrialAccount, trialAccountInitiated));
    }

    @Async
    public void sendApprovedConfirmation(UserDTO userDTO) {
        Payload payload = Payload.builder()
            .text(userDTO.getEmail() + " has been approved and notified automatically")
            .build();

        Slack slack = Slack.getInstance();
        try {
            // This is an automatic message when user from whitelist is registered.
            WebhookResponse response = slack.send(this.applicationProperties.getUserRegistrationWebhook(), payload);
        } catch (IOException e) {
            log.warn("Failed to send message to slack");
        }
    }

    @Async
    public void sendConfirmationOnUserAcceptsTrialAgreement(UserDTO userDTO, Instant tokenExpiresOn) {
        String expirationDate = toNYZoneTime(tokenExpiresOn);
        Payload payload = Payload.builder()
            .text(userDTO.getEmail() + " has read and agreed to the trial license agreement. The account has been activated, the trial period ends on " + expirationDate)
            .build();

        Slack slack = Slack.getInstance();
        try {
            WebhookResponse response = slack.send(this.applicationProperties.getUserRegistrationWebhook(), payload);

            Context context = new Context();
            context.setVariable(EXPIRATION, expirationDate);
            mailService.sendEmailFromTemplate(
                userDTO,
                MailType.TRIAL_ACCOUNT_IS_ACTIVATED,
                "Trial Account Activated",
                applicationProperties.getEmailAddresses().getLicenseAddress(),
                applicationProperties.getEmailAddresses().getContactAddress(),
                null,
                null,
                context
            );
        } catch (IOException e) {
            log.warn("Failed to send message to slack");
        }
    }

    public ActionId getActionId(BlockActionPayload blockActionPayload) {
        List<String> actionIds = blockActionPayload.getActions().stream().map(action -> action.getActionId()).collect(Collectors.toList());
        for (String actionIdStr : actionIds) {
            ActionId actionId = ActionId.getById(actionIdStr);
            if (actionId != null) {
                return actionId;
            }
        }
        return null;
    }

    public Optional<BlockActionPayload.Action> getAction(BlockActionPayload blockActionPayload, ActionId actionKey) {
        return blockActionPayload.getActions().stream().filter(action -> action.getActionId().equalsIgnoreCase(actionKey.getId())).findFirst();
    }

    private TextObject getTextObject(String title, String content) {
        StringBuilder sb = new StringBuilder();
        sb.append("*" + title + ":*\n");
        sb.append(content);
        return MarkdownTextObject.builder().text(sb.toString()).build();
    }

    private void sendBlocks(String url, List<LayoutBlock> layoutBlocks) {
        Payload payload = Payload.builder()
            .blocks(layoutBlocks)
            .build();

        Slack slack = Slack.getInstance();
        try {
            WebhookResponse response = slack.send(url, payload);
            log.info("Send the latest user blocks to slack with response code " + response.getCode());
        } catch (Exception e) {
            log.warn("Failed to send message to slack");
        }
    }

    public List<LayoutBlock> buildBlocks(UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated) {
        List<LayoutBlock> blocks = new ArrayList<>();

        // Add mention
        blocks.add(buildHereMentionBlock());

        // Add warning
        blocks.addAll(buildWarningBlocks(userDTO));

        // Add current license
        blocks.addAll(buildCurrentLicense(userDTO));

        // Add account status
        blocks.addAll(buildAccountStatusBlocks(userDTO, isTrialAccount));

        // Add user info section
        blocks.addAll(buildUserInfoBlocks(userDTO));

        // Add additional info section
        blocks.addAll(buildAdditionalInfoBlocks(userDTO, trialAccountInitiated));

        // Add action section
        blocks.addAll(buildActionBlocks(userDTO, trialAccountInitiated, isTrialAccount));

        return blocks;
    }

    private LayoutBlock buildHereMentionBlock() {
        if (applicationProperties.getProfile() != null && applicationProperties.getProfile().equals(ProjectProfile.PROD)) {
            return SectionBlock.builder().text(MarkdownTextObject.builder().text("<!here>").build()).build();
        } else {
            return SectionBlock.builder().text(PlainTextObject.builder().text("[placeholder for @here handle]").build()).build();
        }
    }

    private LayoutBlock buildChannelMentionBlock() {
        if (applicationProperties.getProfile() != null && applicationProperties.getProfile().equals(ProjectProfile.PROD)) {
            return SectionBlock.builder().text(MarkdownTextObject.builder().text("<!channel>").build()).build();
        } else {
            return SectionBlock.builder().text(PlainTextObject.builder().text("[placeholder for @channel handle]").build()).build();
        }
    }

    private List<LayoutBlock> buildWarningBlocks(UserDTO userDTO) {
        List<LayoutBlock> blocks = new ArrayList<>();
        final String LICENSED_DOMAIN_APPROVE_NOTE = ":star: *This email domain belongs to a licensed company. Please review and approve accordingly.*";
        final String TRIALED_DOMAIN_APPROVE_NOTE = ":bangbang: *This email domain belongs to a company that has trial license.*";

        boolean domainIsLicensed = false;
        boolean domainIsTrialed = false;
        List<String> licensedDomains = applicationProperties.getLicensedDomainsList();
        if (!licensedDomains.isEmpty() && licensedDomains.stream().anyMatch(domain -> getEmailDomain(userDTO.getEmail().toLowerCase()).equals(domain.toLowerCase()))) {
            domainIsLicensed = true;
        }
        List<String> trialedDomains = applicationProperties.getTrialedDomainsList();
        if (!trialedDomains.isEmpty() && trialedDomains.stream().anyMatch(domain -> getEmailDomain(userDTO.getEmail().toLowerCase()).equals(domain.toLowerCase()))) {
            domainIsTrialed = true;
        }

        if (domainIsLicensed)
            blocks.add(SectionBlock.builder().text(MarkdownTextObject.builder().text(LICENSED_DOMAIN_APPROVE_NOTE).build()).build());
        if (domainIsTrialed)
            blocks.add(SectionBlock.builder().text(MarkdownTextObject.builder().text(TRIALED_DOMAIN_APPROVE_NOTE).build()).build());

        if (blocks.size() > 0) {
            blocks.add(DividerBlock.builder().build());
        } else {
            return new ArrayList<>();
        }

        return blocks;
    }

    private List<LayoutBlock> buildCurrentLicense(UserDTO userDTO) {
        List<LayoutBlock> blocks = new ArrayList<>();

        blocks.add(
            SectionBlock
                .builder()
                .fields(
                    Collections.singletonList(
                        MarkdownTextObject.builder().text(":key: *License:*").build()
                    )
                )
                .build()
        );

        blocks.add(
            SectionBlock
                .builder()
                .text(MarkdownTextObject.builder().text(userDTO.getLicenseType().getName()).build())
                .accessory(this.getLicenseTypeElement(userDTO))
                .build()
        );

        blocks.add(DividerBlock.builder().build());
        return blocks;
    }

    private List<LayoutBlock> buildAccountStatusBlocks(UserDTO userDTO, boolean isTrialAccount) {
        List<LayoutBlock> blocks = new ArrayList<>();
        List<TextObject> userInfo = new ArrayList<>();

        // Add account information
        blocks.add(SectionBlock.builder().fields(Collections.singletonList(MarkdownTextObject.builder().text(":oncokb-9760: *Account Status*").build())).build());


        userInfo.add(getTextObject("Account Status", userDTO.isActivated() ? "Activated" : (StringUtils.isNotEmpty(userDTO.getActivationKey()) ? "Email not validated" : "Not Activated")));
        userInfo.add(getTextObject("Account Type", isTrialAccount ? "TRIAL" : "REGULAR"));
        if (isTrialAccount) {
            userInfo.add(getTextObject("Trial Expires On", toNYZoneTime(userDTO.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate().plusSeconds(DAY_IN_SECONDS * 90))));
        }
        blocks.add(SectionBlock.builder().fields(userInfo).build());

        blocks.add(DividerBlock.builder().build());
        return blocks;
    }

    private String getOptionValue(LicenseType licenseType, String login) {
        return String.join(VALUE_SEPARATOR, licenseType.toString(), login);
    }

    public String getOptionValueLogin(String value) {
        String[] values = value.split(VALUE_SEPARATOR);
        return values[1];
    }

    public String getOptionValueLicenseType(String value) {
        String[] values = value.split(VALUE_SEPARATOR);
        return values[0];
    }

    private StaticSelectElement getLicenseTypeElement(UserDTO userDTO) {
        List<OptionObject> options = new ArrayList<>();
        for (LicenseType licenseType : LicenseType.values()) {
            if (userDTO.getLicenseType() != licenseType) {
                options.add(OptionObject
                    .builder()
                    .value(this.getOptionValue(licenseType, userDTO.getLogin()))
                    .text(PlainTextObject.builder().text(licenseType.getName()).build())
                    .build());
            }
        }
        return StaticSelectElement
            .builder()
            .actionId(CHANGE_LICENSE_TYPE.getId())
            .placeholder(PlainTextObject.builder().text("Update license type").build())
            .options(options)
            .build();
    }

    private List<LayoutBlock> buildUserInfoBlocks(UserDTO user) {
        List<LayoutBlock> blocks = new ArrayList<>();
        String companyName = "Company";

        if (user.getLicenseType() != null) {
            if (user.getLicenseType().equals(LicenseType.ACADEMIC)) {
                companyName = "Institute";
            } else if (user.getLicenseType().equals(LicenseType.HOSPITAL)) {
                companyName = "Hospital";
            }
        }

        // Add account information
        blocks.add(SectionBlock.builder().fields(Collections.singletonList(MarkdownTextObject.builder().text(":sunny: *Account Information*").build())).build());
        List<TextObject> userInfo = new ArrayList<>();
        userInfo.add(getTextObject("Email", user.getEmail()));
        userInfo.add(getTextObject("Name", user.getFirstName() + " " + user.getLastName()));
        userInfo.add(getTextObject("Job Title", user.getJobTitle()));
        blocks.add(SectionBlock.builder().fields(userInfo).build());
        blocks.add(DividerBlock.builder().build());

        // Add company information
        blocks.add(SectionBlock.builder().fields(Collections.singletonList(MarkdownTextObject.builder().text(":sunflower: *" + companyName + " Information*").build())).build());
        userInfo = new ArrayList<>();
        userInfo.add(getTextObject(companyName, user.getCompany()));
        userInfo.add(getTextObject("City", user.getCity()));
        userInfo.add(getTextObject("Country", user.getCountry()));
        AdditionalInfoDTO additionalInfoDTO = user.getAdditionalInfo();
        if (additionalInfoDTO != null && additionalInfoDTO.getUserCompany() != null) {
            if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getDescription())) {
                userInfo.add(getTextObject(companyName + " Description", additionalInfoDTO.getUserCompany().getDescription()));
            }
            if (additionalInfoDTO.getUserCompany().getBusinessContact() != null) {
                if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getBusinessContact().getEmail())) {
                    userInfo.add(getTextObject("Business Contact Email", additionalInfoDTO.getUserCompany().getBusinessContact().getEmail()));
                }
                if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getBusinessContact().getPhone())) {
                    userInfo.add(getTextObject("Business Contact Phone", additionalInfoDTO.getUserCompany().getBusinessContact().getPhone()));
                }
            }
            if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getUseCase())) {
                userInfo.add(getTextObject("Use Case", additionalInfoDTO.getUserCompany().getUseCase()));
            }
            if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getAnticipatedReports())) {
                userInfo.add(getTextObject("Anticipated Reports", additionalInfoDTO.getUserCompany().getAnticipatedReports()));
            }
            if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getSize())) {
                userInfo.add(getTextObject(companyName + " Size", additionalInfoDTO.getUserCompany().getSize()));
            }
        }
        blocks.add(SectionBlock.builder().fields(userInfo).build());
        blocks.add(DividerBlock.builder().build());

        return blocks;
    }

    private boolean withClarificationNote(UserDTO userDTO) {
        boolean withClarificationNote = false;
        if (userDTO.getLicenseType().equals(LicenseType.ACADEMIC) &&
            this.applicationProperties.getAcademicEmailClarifyDomains().size() > 0 &&
            this.applicationProperties.getAcademicEmailClarifyDomains().stream().filter(domain -> userDTO.getEmail().endsWith(domain)).collect(Collectors.toList()).size() > 0) {
            withClarificationNote = true;
            mailService.sendEmailWithLicenseContext(userDTO, MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, applicationProperties.getEmailAddresses().getLicenseAddress(), null, null);
        }
        return withClarificationNote;
    }

    private List<LayoutBlock> buildAdditionalInfoBlocks(UserDTO userDTO, boolean trialAccountInitiated) {
        final String ACADEMIC_CLARIFICATION_NOTE = "We have sent the clarification email to the user asking why they could not use an institution email to register.";
        List<LayoutBlock> layoutBlocks = new ArrayList<>();

        if (withClarificationNote(userDTO)) {
            layoutBlocks.add(buildPlainTextBlock(ACADEMIC_CLARIFICATION_NOTE));
        }
        if (trialAccountInitiated) {
            layoutBlocks.add(buildPlainTextBlock("We have initialized the trial account for the user."));
        }
        if (isMSKUser(userDTO)) {
            layoutBlocks.add(buildPlainTextBlock("The user has been approved and notified automatically. We also changed their license to Academic and clarified with the user."));
        }

        if (layoutBlocks.size() > 0) {
            layoutBlocks.add(DividerBlock.builder().build());
        }
        return layoutBlocks;
    }

    private List<LayoutBlock> buildActionBlocks(UserDTO userDTO, boolean trialAccountInitiated, boolean isTrialAccount) {
        List<LayoutBlock> layoutBlocks = new ArrayList<>();
        List<BlockElement> actionElements = new ArrayList<>();

        // Add button - Approve
        if (!userDTO.isActivated()) {
            actionElements.add(buildApproveButton(userDTO));
        }

        // Add button - Give Trial Access
        if (userDTO.getLicenseType() != LicenseType.ACADEMIC && !trialAccountInitiated && !userDTO.isActivated()) {
            actionElements.add(buildGiveTrialAccessButton(userDTO));
        }

        // Add button - Convert trial account to regular
        if (isTrialAccount) {
            actionElements.add(buildConvertToRegularAccountButton(userDTO));
        }

        // Add button - Update
        actionElements.add(buildUpdateUserButton(userDTO));
        layoutBlocks.add(ActionsBlock.builder().elements(actionElements).build());
        return layoutBlocks;
    }

    private ConfirmationDialogObject buildConfirmationDialogObject(String bodyText) {
        ConfirmationDialogObject confirmationDialogObject = ConfirmationDialogObject.builder()
            .title(PlainTextObject.builder().text("Are you sure?").build())
            .text(PlainTextObject.builder().text(bodyText).build())
            .confirm(PlainTextObject.builder().text("Yes").build())
            .deny(PlainTextObject.builder().text("No").build())
            .build();
        return confirmationDialogObject;
    }

    private ButtonElement buildUpdateUserButton(UserDTO user) {
        return buildPrimaryButton("Update Info Above", user.getLogin(), UPDATE_USER);
    }

    private ButtonElement buildApproveButton(UserDTO user) {
        ButtonElement button = buildPrimaryButton("Approve", user.getLogin(), APPROVE_USER);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to approve a commercial account."));
        }
        return button;
    }

    private ButtonElement buildGiveTrialAccessButton(UserDTO user) {
        ButtonElement button = buildPrimaryButton("Give Trial Access", user.getLogin(), GIVE_TRIAL_ACCESS);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to give the user 3 month trial period. The user will get notified through email. Once they are ok with the free trial license agreement, their account will be activated."));
        }
        return button;
    }

    private ButtonElement buildConvertToRegularAccountButton(UserDTO user) {
        ButtonElement button = buildPrimaryButton("Convert to regular account", user.getLogin(), CONVERT_TO_REGULAR_ACCOUNT);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to convert a trial account to regular."));
        }
        return button;
    }

    private ButtonElement buildPrimaryButton(String text, String value, ActionId actionId) {
        ButtonElement button = ButtonElement.builder()
            .text(PlainTextObject.builder().emoji(true).text(text).build())
            .style("primary")
            .actionId(actionId.getId())
            .value(value)
            .build();
        return button;
    }

    private LayoutBlock buildPlainTextBlock(String text) {
        return SectionBlock.builder().text(PlainTextObject.builder().text(text).build()).build();
    }
}
