package org.mskcc.cbio.oncokb.service;

import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.methods.SlackApiException;
import com.slack.api.methods.response.conversations.ConversationsHistoryResponse;
import com.slack.api.model.Message;
import com.slack.api.model.block.*;
import com.slack.api.model.block.composition.*;
import com.slack.api.model.block.element.BlockElement;
import com.slack.api.model.block.element.ButtonElement;
import com.slack.api.model.block.element.StaticSelectElement;
import com.slack.api.webhook.Payload;
import com.slack.api.webhook.WebhookResponse;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.UserIdMessagePair;
import org.mskcc.cbio.oncokb.domain.enumeration.*;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

import static org.mskcc.cbio.oncokb.config.Constants.*;
import static org.mskcc.cbio.oncokb.util.MainUtil.isMSKUser;
import static org.mskcc.cbio.oncokb.util.StringUtil.getEmailDomain;
import static org.mskcc.cbio.oncokb.util.TimeUtil.toNYZoneTime;
import static org.mskcc.cbio.oncokb.web.rest.slack.ActionId.*;
import static org.mskcc.cbio.oncokb.web.rest.slack.BlockId.*;


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
        if (StringUtils.isEmpty(this.applicationProperties.getSlack().getUserRegistrationWebhook())) {
            log.debug("\tSkipped, the webhook is not configured");
        } else {
            List<LayoutBlock> layoutBlocks = this.buildBlocks(user, isTrialAccount, trialAccountInitiated, null);
            this.sendBlocks(this.applicationProperties.getSlack().getUserRegistrationWebhook(), layoutBlocks);
        }
    }

    @Async
    public void sendLatestBlocks(String url, UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated, BlockActionPayload blockActionPayload) {
        this.sendBlocks(url, this.buildBlocks(userDTO, isTrialAccount, trialAccountInitiated, blockActionPayload));
    }

    @Async
    public void sendApprovedConfirmation(UserDTO userDTO) {
        Payload payload = Payload.builder()
            .text(userDTO.getEmail() + " has been approved and notified automatically")
            .build();

        Slack slack = Slack.getInstance();
        try {
            // This is an automatic message when user from whitelist is registered.
            WebhookResponse response = slack.send(this.applicationProperties.getSlack().getUserRegistrationWebhook(), payload);
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
            WebhookResponse response = slack.send(this.applicationProperties.getSlack().getUserRegistrationWebhook(), payload);

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
        if (title != null) {
            sb.append(title + ":\n");
        }
        if (content != null) {
            sb.append("*" + content + "*");
        }
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

    public List<LayoutBlock> buildBlocks(UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated, BlockActionPayload responseBlockActionPayload) {
        List<LayoutBlock> blocks = new ArrayList<>();
        ActionId actionId = null;
        if (responseBlockActionPayload != null) {
            actionId = getActionId(responseBlockActionPayload);
        }

        boolean collapsed = ((userDTO.isActivated() || trialAccountInitiated || isMSKUser(userDTO) || withClarificationNote(userDTO, false)) && !(actionId != null && (actionId.equals(EXPAND) || actionId.equals(UPDATE_USER) || actionId.equals(CHANGE_LICENSE_TYPE)))) || (actionId != null && actionId == COLLAPSE);
        if (collapsed) {
            // Add collapsed blocks
            blocks.add(buildCollapsedBlock(userDTO, isTrialAccount, trialAccountInitiated));
        } else {
            // Add expanded blocks
            blocks.addAll(buildExpandedBlocks(userDTO, isTrialAccount, trialAccountInitiated, responseBlockActionPayload));
        }

        // Add message divider
        blocks.add(DividerBlock.builder().build());

        return blocks;
    }

    private LayoutBlock buildCollapsedBlock(UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated) {
        boolean isTrial = trialAccountInitiated && (!userDTO.isActivated() || isTrialAccount);
        return SectionBlock.builder().text(MarkdownTextObject.builder().text(userDTO.getEmail() + "\n" + userDTO.getCompany() + " (" + userDTO.getLicenseType().getShortName() + (isTrial ? ", *TRIAL*" : userDTO.isActivated() ? "" : ", *NOT ACTIVATED*") + ")").build()).accessory(buildExpandButton(userDTO)).blockId(COLLAPSED.getId()).build();
    }

    private List<LayoutBlock> buildExpandedBlocks(UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated, BlockActionPayload responseBlockActionPayload) {
        List<LayoutBlock> blocks = new ArrayList<>();

        // Add mention
        blocks.add(buildHereMentionBlock());

        // Add user id
        blocks.add(buildUserIdBlock(userDTO));

        // Add warning
        blocks.addAll(buildWarningBlocks(userDTO));

        // Add current license
        blocks.add(buildCurrentLicense(userDTO));

        // Add account status
        blocks.add(buildAccountStatusBlock(userDTO, isTrialAccount));

        // Add user info section
        blocks.addAll(buildUserInfoBlocks(userDTO));

        // Add additional info section
        blocks.addAll(buildAdditionalInfoBlocks(userDTO, isTrialAccount, trialAccountInitiated));

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

    private LayoutBlock buildUserIdBlock(UserDTO userDTO) {
        List<ContextBlockElement> elements = new ArrayList<>();
        elements.add(PlainTextObject.builder().text("User ID: " + userDTO.getId()).build());
        return ContextBlock.builder().elements(elements).blockId(USER_ID.getId()).build();
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

        return blocks;
    }

    private LayoutBlock buildCurrentLicense(UserDTO userDTO) {
        StringBuilder sb = new StringBuilder();
        sb.append("*" + userDTO.getLicenseType().getName() + "*" + (userDTO.getLicenseType().equals(LicenseType.ACADEMIC) ? "" : " :clap:") +"\n");
        if (userDTO.getCompany() != null) {
            sb.append("*" + userDTO.getCompany() + "*");
        }

        return SectionBlock.builder().text(MarkdownTextObject.builder().text(sb.toString()).build()).accessory(getLicenseTypeElement(userDTO)).blockId(LICENSE_TYPE.getId()).build();
    }

    private LayoutBlock buildAccountStatusBlock(UserDTO userDTO, boolean isTrialAccount) {
        List<TextObject> userInfo = new ArrayList<>();

        // Add account information
        userInfo.add(getTextObject("Account Status", userDTO.isActivated() ? "Activated" : (StringUtils.isNotEmpty(userDTO.getActivationKey()) ? "Email not validated" : "Not Activated")));
        userInfo.add(getTextObject("Account Type", isTrialAccount ? "TRIAL" : "REGULAR"));
        if (isTrialAccount) {
            userInfo.add(getTextObject("Trial Expires On", toNYZoneTime(userDTO.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate().plusSeconds(DAY_IN_SECONDS * 90))));
        }
        return SectionBlock.builder().fields(userInfo).blockId(ACCOUNT_STATUS.getId()).build();
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

    public boolean withClarificationNote(UserDTO userDTO, boolean sendEmail) {
        boolean withClarificationNote = false;
        if (userDTO.getLicenseType().equals(LicenseType.ACADEMIC) &&
            this.applicationProperties.getAcademicEmailClarifyDomains().size() > 0 &&
            this.applicationProperties.getAcademicEmailClarifyDomains().stream().filter(domain -> userDTO.getEmail().endsWith(domain)).collect(Collectors.toList()).size() > 0) {
            withClarificationNote = true;
            if (sendEmail) {
                mailService.sendEmailWithLicenseContext(userDTO, MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, applicationProperties.getEmailAddresses().getLicenseAddress(), null, null);
            }
        }
        return withClarificationNote;
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
        List<TextObject> userInfo = new ArrayList<>();
        userInfo.add(MarkdownTextObject.builder().text("Email:\n" + user.getEmail()).build());
        userInfo.add(getTextObject("Name", user.getFirstName() + " " + user.getLastName()));
        userInfo.add(getTextObject("Job Title", user.getJobTitle()));
        userInfo.add(getTextObject(companyName, user.getCompany()));
        blocks.add(SectionBlock.builder().fields(userInfo).blockId(ACCOUNT_INFO.getId()).build());

        // Add company information
        userInfo = new ArrayList<>();
        userInfo.add(getTextObject("City", user.getCity()));
        userInfo.add(getTextObject("Country", user.getCountry()));
        AdditionalInfoDTO additionalInfoDTO = user.getAdditionalInfo();
        if (additionalInfoDTO != null && additionalInfoDTO.getUserCompany() != null) {
            if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getDescription())) {
                userInfo.add(getTextObject(companyName + " Description", additionalInfoDTO.getUserCompany().getDescription()));
            }
            if (additionalInfoDTO.getUserCompany().getBusinessContact() != null) {
                if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getBusinessContact().getEmail())) {
                    userInfo.add(MarkdownTextObject.builder().text("Business Contact Email:\n" + additionalInfoDTO.getUserCompany().getBusinessContact().getEmail()).build());
                }
                if (StringUtils.isNotEmpty(additionalInfoDTO.getUserCompany().getBusinessContact().getPhone())) {
                    userInfo.add(MarkdownTextObject.builder().text("Business Contact Phone:\n" + additionalInfoDTO.getUserCompany().getBusinessContact().getPhone()).build());
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
        blocks.add(SectionBlock.builder().fields(userInfo).blockId(ORGANIZATION_INFO.getId()).build());

        return blocks;
    }

    private List<LayoutBlock> buildAdditionalInfoBlocks(UserDTO userDTO, boolean isTrialAccount, boolean trialAccountInitiated) {
        List<LayoutBlock> layoutBlocks = new ArrayList<>();

        if (withClarificationNote(userDTO, false)) {
            layoutBlocks.add(buildPlainTextBlock("We have sent the clarification email to the user asking why they could not use an institution email to register.", ACADEMIC_CLARIFICATION_NOTE));
        }
        if (isMSKUser(userDTO)) {
            layoutBlocks.add(buildPlainTextBlock("The user has been approved and notified automatically. We also changed their license to Academic and clarified with the user.", MSK_USER_NOTE));
        }
        if (userDTO.getLicenseType() != LicenseType.ACADEMIC && trialAccountInitiated && (!userDTO.isActivated() || isTrialAccount)) {
                layoutBlocks.add(buildPlainTextBlock("The trial account has been initialized and notified.", TRIAL_ACCOUNT_NOTE));
        } else if (!trialAccountInitiated && userDTO.isActivated()) {
                layoutBlocks.add(buildPlainTextBlock("The user has been approved and notified.", APPROVED_NOTE));
        } else if (trialAccountInitiated && userDTO.isActivated() && !isTrialAccount) {
                layoutBlocks.add(buildPlainTextBlock("The trial account has been converted to a regular account.", CONVERT_TO_REGULAR_ACCOUNT_NOTE));
        }

        return layoutBlocks;
    }

    public List<UserIdMessagePair> getAllUnapprovedUserRequestsSentAfter(int daysAgo) {
        List<UserIdMessagePair> userList = new ArrayList<>();
        Slack slack = Slack.getInstance();
        try {
            String daysAgoTs = Long.toString(Instant.now().getEpochSecond() - DAY_IN_SECONDS * daysAgo);
            ConversationsHistoryResponse conversationsHistory = slack.methods().conversationsHistory(r -> r
                .token(applicationProperties.getSlack().getSlackBotOauthToken())
                .channel(applicationProperties.getSlack().getUserRegistrationChannelId())
                .oldest(daysAgoTs)
                .limit(1000)
                .inclusive(true));
            Collections.reverse(conversationsHistory.getMessages());
            for (Message message : conversationsHistory.getMessages()) {
                if (Objects.nonNull(message.getText()) && message.getText().equals("This content can't be displayed.") && Objects.nonNull(message.getBlocks())) {
                    if (!(getBlockWithId(message.getBlocks(), COLLAPSED).isPresent()
                            || getBlockWithId(message.getBlocks(), ACADEMIC_CLARIFICATION_NOTE).isPresent()
                            || getBlockWithId(message.getBlocks(), MSK_USER_NOTE).isPresent()
                            || getBlockWithId(message.getBlocks(), TRIAL_ACCOUNT_NOTE).isPresent()
                            || getBlockWithId(message.getBlocks(), APPROVED_NOTE).isPresent()
                            || getBlockWithId(message.getBlocks(), CONVERT_TO_REGULAR_ACCOUNT_NOTE).isPresent())
                    ) {
                        if (getBlockWithId(message.getBlocks(), USER_ID).isPresent()) {
                            ContextBlock userIdBlock = (ContextBlock) getBlockWithId(message.getBlocks(), USER_ID).get();
                            PlainTextObject userIdText = (PlainTextObject) userIdBlock.getElements().get(0);
                            Long userId = Long.parseLong(userIdText.getText().substring(9));
                            userList.add(new UserIdMessagePair(userId, message));
                        }
                    }
                }
            }
        } catch (IOException | SlackApiException e) {
            log.error("error: {}", e.getMessage(), e);
        }
        return userList;
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

        // Add button - Collapse
        actionElements.add(buildCollapseButton(userDTO));

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
        return buildButton("Update Info Above", user.getLogin(), UPDATE_USER);
    }

    private ButtonElement buildApproveButton(UserDTO user) {
        ButtonElement button = buildPrimaryButton("Approve", user.getLogin(), APPROVE_USER);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to approve a commercial account."));
        }
        return button;
    }

    private ButtonElement buildGiveTrialAccessButton(UserDTO user) {
        ButtonElement button = buildButton("Give Trial Access", user.getLogin(), GIVE_TRIAL_ACCESS);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to give the user 3 month trial period. The user will get notified through email. Once they are ok with the free trial license agreement, their account will be activated."));
        }
        return button;
    }

    private ButtonElement buildConvertToRegularAccountButton(UserDTO user) {
        ButtonElement button = buildButton("Convert to regular account", user.getLogin(), CONVERT_TO_REGULAR_ACCOUNT);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to convert a trial account to regular."));
        }
        return button;
    }

    private ButtonElement buildCollapseButton(UserDTO user) {
        return buildButton("Collapse", user.getLogin(), COLLAPSE);
    }

    private ButtonElement buildExpandButton(UserDTO user) {
        return buildButton("Expand", user.getLogin(), EXPAND);
    }

    private ButtonElement buildPrimaryButton(String text, String value, ActionId actionId) {
        return buildButton(text, value, actionId, ButtonStyle.PRIMARY);
    }

    private ButtonElement buildDangerButton(String text, String value, ActionId actionId) {
        return buildButton(text, value, actionId, ButtonStyle.DANGER);
    }

    private ButtonElement buildButton(String text, String value, ActionId actionId) {
        return buildButton(text, value, actionId, null);
    }

    private ButtonElement buildButton(String text, String value, ActionId actionId, ButtonStyle buttonStyle) {
        ButtonElement button = ButtonElement.builder()
            .text(PlainTextObject.builder().emoji(true).text(text).build())
            .actionId(actionId.getId())
            .value(value)
            .build();
        if (buttonStyle != null) {
            button.setStyle(buttonStyle.getStyle());
        }
        return button;
    }

    private LayoutBlock buildPlainTextBlock(String text, BlockId blockId) {
        return SectionBlock.builder().text(PlainTextObject.builder().text(text).build()).blockId(blockId.getId()).build();
    }

    private Optional<LayoutBlock> getBlockWithId(List<LayoutBlock> blocks, BlockId blockId) {
        for (LayoutBlock block : blocks) {
            if (block.getClass().getName().equals("com.slack.api.model.block.SectionBlock")) {
                SectionBlock sectionBlock = (SectionBlock) block;
                if (Objects.nonNull(sectionBlock.getBlockId()) && sectionBlock.getBlockId().equals(blockId.getId())) {
                    return Optional.of(block);
                }
            } else if (block.getClass().getName().equals("com.slack.api.model.block.ContextBlock")) {
                ContextBlock contextBlock = (ContextBlock) block;
                if (Objects.nonNull(contextBlock.getBlockId()) && contextBlock.getBlockId().equals(blockId.getId())) {
                    return Optional.of(block);
                }
            }
        }
        return Optional.empty();
    }
}

enum ButtonStyle {
    PRIMARY("primary"), DANGER("danger");
    String style;

    ButtonStyle(String style) {
        this.style = style;
    }

    public String getStyle() {
        return style;
    }
}
