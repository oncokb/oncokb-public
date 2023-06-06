package org.mskcc.cbio.oncokb.service;

import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.app_backend.views.payload.ViewSubmissionPayload;
import com.slack.api.methods.SlackApiException;
import com.slack.api.methods.request.views.ViewsOpenRequest;
import com.slack.api.methods.response.conversations.ConversationsHistoryResponse;
import com.slack.api.methods.response.views.ViewsOpenResponse;
import com.slack.api.model.Message;
import com.slack.api.model.block.*;
import com.slack.api.model.block.composition.*;
import com.slack.api.model.block.element.BlockElement;
import com.slack.api.model.block.element.ButtonElement;
import com.slack.api.model.block.element.PlainTextInputElement;
import com.slack.api.model.block.element.StaticSelectElement;
import com.slack.api.model.view.View;
import com.slack.api.model.view.ViewSubmit;
import com.slack.api.model.view.ViewTitle;
import com.slack.api.webhook.Payload;
import com.slack.api.webhook.WebhookResponse;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.UserIdMessagePair;
import org.mskcc.cbio.oncokb.domain.enumeration.*;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.util.ObjectUtil;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.mskcc.cbio.oncokb.web.rest.slack.DropdownEmailOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.mskcc.cbio.oncokb.config.Constants.*;
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
    private final UserMailsService userMailsService;

    @Autowired
    private UserMapper userMapper;

    public SlackService(ApplicationProperties applicationProperties, MailService mailService, EmailService emailService, UserMailsService userMailsService) {
        this.applicationProperties = applicationProperties;
        this.mailService = mailService;
        this.emailService = emailService;
        this.userMailsService = userMailsService;
    }

    @Async
    public void sendUserRegistrationToChannel(UserDTO user, boolean trialAccountActivated, Company company) {
        boolean withNote = withNote(DropdownEmailOption.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, user, null);
        if (withNote) {
            mailService.sendAcademicClarificationEmail(user);
        }

        log.debug("Sending notification to admin group that a user has registered a new account");
        if (StringUtils.isEmpty(this.applicationProperties.getSlack().getUserRegistrationWebhook())) {
            log.debug("\tSkipped, the webhook is not configured");
        } else {
            List<LayoutBlock> layoutBlocks = this.buildBlocks(user, trialAccountActivated, null, company);
            this.sendBlocks(this.applicationProperties.getSlack().getUserRegistrationWebhook(), layoutBlocks);
        }
    }

    @Async
    public void sendLatestBlocks(String url, UserDTO userDTO, boolean trialAccountActivated, ActionId actionId, String triggerId) {
        if (ActionId.isEmailAction(actionId)) {
            this.sendModal(triggerId, this.buildModalView(userDTO, actionId, url));
        } else {
            this.sendBlocks(url, this.buildBlocks(userDTO, trialAccountActivated, actionId, null));
        }
    }

    @Async
    public void sendApprovedConfirmation(UserDTO userDTO, Company company) {
        String text =
            String.format(
                "%s has been approved to use %s's %s license and notified automatically.",
                userDTO.getEmail(),
                company.getName(),
                company.getLicenseType().getShortName()
            );
        Payload payload = Payload.builder()
            .text(text)
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

    public List<UserIdMessagePair> getAllUnapprovedUserRequestsSentAfter(int daysAgo) {
        List<UserIdMessagePair> userList = new ArrayList<>();
        Slack slack = Slack.getInstance();
        final String REQUEST_MESSAGE_TEXT = "This content can't be displayed.";

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
                if (Objects.nonNull(message.getText()) && message.getText().equals(REQUEST_MESSAGE_TEXT) && Objects.nonNull(message.getBlocks())) {
                    if (!(getBlockWithId(message.getBlocks(), COLLAPSED).isPresent())
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

    public ActionId getActionId(BlockActionPayload blockActionPayload) {
        List<String> actionIds = blockActionPayload.getActions().stream().map(action -> action.getActionId()).collect(Collectors.toList());
        for (String actionIdStr : actionIds) {
            ActionId actionId = ActionId.getById(actionIdStr);
            if (actionId != null) {
                if (actionId == MORE_ACTIONS) {
                    actionId = getActionIdFromMoreActions(blockActionPayload);
                    getAction(blockActionPayload, MORE_ACTIONS).get().setActionId(actionId.getId());
                }
                return actionId;
            }
        }
        return null;
    }

    public ActionId getActionId(ViewSubmissionPayload viewSubmissionPayload) {
        return ActionId.getById(viewSubmissionPayload.getView().getCallbackId());
    }

    public Optional<BlockActionPayload.Action> getAction(BlockActionPayload blockActionPayload, ActionId actionKey) {
        return blockActionPayload.getActions().stream().filter(action -> action.getActionId().equalsIgnoreCase(actionKey.getId())).findFirst();
    }

    private TextObject getTextObject(String title, String content) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.isNotEmpty(title)) {
            sb.append(title + ":\n");
        }
        if (StringUtils.isNotEmpty(content)) {
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

    public List<LayoutBlock> buildBlocks(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId, Company company) {
        List<LayoutBlock> blocks = new ArrayList<>();
        boolean buildCollapsed;
        if (actionId != null) {
            boolean expandedAction = actionId.equals(EXPAND) || actionId.equals(UPDATE_USER) || actionId.equals(CHANGE_LICENSE_TYPE);
            buildCollapsed = (isReviewed(userDTO, actionId) && !expandedAction) || actionId.equals(COLLAPSE);
        } else {
            buildCollapsed = isReviewed(userDTO, null);
        }

        if (buildCollapsed) {
            // Add collapsed blocks
            blocks.add(buildCollapsedBlock(userDTO, actionId));
        } else {
            // Add expanded blocks
            blocks.addAll(buildExpandedBlocks(userDTO, trialAccountActivated, actionId, company));
        }

        // Add message divider
        blocks.add(DividerBlock.builder().build());

        return blocks;
    }

    private LayoutBlock buildCollapsedBlock(UserDTO userDTO, ActionId actionId) {
        StringBuilder sb = new StringBuilder();
        sb.append(userDTO.getEmail() + "\n" + userDTO.getCompanyName() + " (" + userDTO.getLicenseType().getShortName() + (withNote(DropdownEmailOption.GIVE_TRIAL_ACCESS, userDTO, actionId) ? ", *TRIAL*)" : userDTO.isActivated() ? ")" : ")\n*NOT ACTIVATED*: "));
        if (!userDTO.isActivated() && !withNote(DropdownEmailOption.GIVE_TRIAL_ACCESS, userDTO, actionId)) {
            List<DropdownEmailOption> sentMails = new ArrayList<>();
            for (DropdownEmailOption mailOption : DropdownEmailOption.values()) {
                if (withNote(mailOption, userDTO, actionId))
                    sentMails.add(mailOption);
            }
            if (!sentMails.isEmpty()) {
                sentMails = sentMails.stream().sorted((mo1, mo2) -> mo1.getCategory() == EmailCategory.DENY ? 1 : 0).collect(Collectors.toList());
                sb.append(sentMails.get(0).getCollapsedNote().orElse(""));
                sentMails.remove(0);
                for (DropdownEmailOption otherSentMail : sentMails) {
                    if (otherSentMail.getCollapsedNote().isPresent())
                        sb.append(", ").append(otherSentMail.getCollapsedNote().get());
                }
            } else {
                sb.append("Collapsed");
            }
        }
        return SectionBlock.builder()
            .text(MarkdownTextObject.builder().text(sb.toString()).build())
            .accessory(buildExpandButton(userDTO)).blockId(COLLAPSED.getId()).build();
    }

    private List<LayoutBlock> buildExpandedBlocks(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId, Company company) {
        List<LayoutBlock> blocks = new ArrayList<>();

        // Add mention
        blocks.add(buildHereMentionBlock());

        // Add user id
        blocks.add(buildUserIdBlock(userDTO));

        // Add warning
        blocks.addAll(buildWarningBlocks(userDTO, company));

        // Add current license
        blocks.add(buildCurrentLicense(userDTO));

        // Add account status
        blocks.add(buildAccountStatusBlock(userDTO, withNote(DropdownEmailOption.GIVE_TRIAL_ACCESS, userDTO, actionId)));

        // Add user info section
        blocks.addAll(buildUserInfoBlocks(userDTO));

        // Add additional info section
        blocks.addAll(buildAdditionalInfoBlocks(userDTO, trialAccountActivated, actionId));

        // Add action section
        blocks.add(buildActionBlock(userDTO, trialAccountActivated, actionId));

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

    private List<LayoutBlock> buildWarningBlocks(UserDTO userDTO, Company company) {
        List<LayoutBlock> blocks = new ArrayList<>();
        if(company != null){
            String text =
                String.format(
                    ":star: *This email domain belongs to %s which has an OncoKB %s%s license. Please review and approve accordingly.*",
                    company.getName(),
                    company.getLicenseType().getShortName(),
                    company.getLicenseStatus().equals(LicenseStatus.TRIAL) ? " trial" : ""
                );
            blocks.add(SectionBlock.builder().text(MarkdownTextObject.builder().text(text).build()).build());
        }

        return blocks;
    }

    private LayoutBlock buildCurrentLicense(UserDTO userDTO) {
        StringBuilder sb = new StringBuilder();
        sb.append("*" + userDTO.getLicenseType().getName() + "*" + (userDTO.getLicenseType().equals(LicenseType.ACADEMIC) ? "" : " :clap:") +"\n");
        if (StringUtils.isNotEmpty(userDTO.getCompanyName())) {
            sb.append("*" + userDTO.getCompanyName() + "*");
        }

        return SectionBlock.builder().text(MarkdownTextObject.builder().text(sb.toString()).build()).accessory(getLicenseTypeElement(userDTO)).blockId(LICENSE_TYPE.getId()).build();
    }

    private LayoutBlock buildAccountStatusBlock(UserDTO userDTO, boolean isTrialAccountInitiated) {
        List<TextObject> userInfo = new ArrayList<>();

        // Add account information
        userInfo.add(getTextObject("Account Status", userDTO.isActivated() ? "Activated" : (StringUtils.isNotEmpty(userDTO.getActivationKey()) ? "Email not validated" : "Not Activated")));
        userInfo.add(getTextObject("Account Type", isTrialAccountInitiated ? "TRIAL" : "REGULAR"));
        if (isTrialAccountInitiated) {
            // There is a period of time when the user has been approved but did not activate their trial yet.
            // In this case, the activationDate is null, so we need to omit this text.
            Instant activationDate = userDTO.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate();
            if (activationDate != null) {
                userInfo.add(getTextObject("Trial Expires On", toNYZoneTime(activationDate.plusSeconds(DAY_IN_SECONDS * 90))));
            }
        }
        return SectionBlock.builder().fields(userInfo).blockId(ACCOUNT_STATUS.getId()).build();
    }

    private String getOptionValue(String argument, String login) {
        return String.join(VALUE_SEPARATOR, argument, login);
    }

    public String getOptionValueLogin(String value) {
        String[] values = value.split(VALUE_SEPARATOR, 2);
        return values[1];
    }

    public String getOptionValueArgument(String value) {
        String[] values = value.split(VALUE_SEPARATOR, 2);
        return values[0];
    }

    public boolean withNote(DropdownEmailOption mailOption, UserDTO userDTO, ActionId actionId) {
        if (!mailOption.getExpandedNote().isPresent())
            return false;

        switch (mailOption) {
            case GIVE_TRIAL_ACCESS:
                if (
                    ObjectUtil.isObjectEmpty(userDTO.getAdditionalInfo())
                        || userDTO.getAdditionalInfo().getTrialAccount() == null
                        || userDTO.getAdditionalInfo().getTrialAccount().getActivation() == null
                ) {
                    return false;
                }
                return StringUtils.isNotEmpty(userDTO.getAdditionalInfo().getTrialAccount().getActivation().getKey()) || userDTO.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate() != null
                    || actionId == GIVE_TRIAL_ACCESS;
            case CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL:
                boolean withAcademicClarificationNote = false;
                if (LicenseType.ACADEMIC.equals(userDTO.getLicenseType())) {
                    if (!this.applicationProperties.getAcademicEmailClarifyDomains().isEmpty()) {
                        List<String> matchedExclusionDomains = this.applicationProperties.getAcademicEmailClarifyDomains().stream().filter(domain -> domain.startsWith("!") && userDTO.getEmail().endsWith(domain.substring(1))).map(domain -> domain.substring(1)).collect(Collectors.toList());
                        if (matchedExclusionDomains.size() > 0) {
                            withAcademicClarificationNote = false;
                        } else {
                            List<String> matchedDomains = this.applicationProperties.getAcademicEmailClarifyDomains().stream().filter(domain -> userDTO.getEmail().endsWith(domain)).collect(Collectors.toList());
                            if (matchedDomains.size() > 0) {
                                withAcademicClarificationNote = true;
                            }
                        }
                    } else if (!userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, null).isEmpty()) {
                        withAcademicClarificationNote = true;
                    }
                }
                return withAcademicClarificationNote
                    || CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL.equals(actionId);
            default:
                return !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), mailOption.getMailType(), null).isEmpty()
                    || actionId == mailOption.getConfirmActionId().orElse(null);
        }
    }

    private boolean isReviewed(UserDTO userDTO, ActionId actionId) {
        if (userDTO.isActivated())
            return true;
        for (DropdownEmailOption mailOption : DropdownEmailOption.values()) {
            if (mailOption.getExpandedNote().isPresent() && withNote(mailOption, userDTO, actionId))
                return true;
        }
        return false;
    }

    private StaticSelectElement getLicenseTypeElement(UserDTO userDTO) {
        List<OptionObject> options = new ArrayList<>();
        for (LicenseType licenseType : LicenseType.values()) {
            if (userDTO.getLicenseType() != licenseType) {
                options.add(OptionObject
                    .builder()
                    .value(this.getOptionValue(licenseType.toString(), userDTO.getLogin()))
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
        userInfo.add(getTextObject(companyName, user.getCompanyName()));
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

    private List<LayoutBlock> buildAdditionalInfoBlocks(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId) {
        List<LayoutBlock> layoutBlocks = new ArrayList<>();

        for (DropdownEmailOption inquiryOption : Arrays.stream(DropdownEmailOption.values()).filter(mo -> mo.getCategory() == EmailCategory.CLARIFY || mo.getCategory() == EmailCategory.LICENSE).collect(Collectors.toList())) {
            if (withNote(inquiryOption, userDTO, actionId))
                layoutBlocks.add(buildPlainTextBlock(inquiryOption.getExpandedNote().orElse(null), inquiryOption.getBlockId().orElse(null)));
        }
        if (userDTO.isActivated() && !trialAccountActivated) {
            if (!withNote(DropdownEmailOption.GIVE_TRIAL_ACCESS, userDTO, actionId)) {
                layoutBlocks.add(buildPlainTextBlock("The user has been approved and notified.", APPROVED_NOTE));
            } else {
                layoutBlocks.add(buildPlainTextBlock("The trial account has been converted to a regular account.", CONVERT_TO_REGULAR_ACCOUNT_NOTE));
            }
        } else if (withNote(DropdownEmailOption.GIVE_TRIAL_ACCESS, userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("The trial account has been initialized and notified.", TRIAL_ACCOUNT_NOTE));
        } else {
            for (DropdownEmailOption rejectOption : Arrays.stream(DropdownEmailOption.values()).filter(mo -> mo.getCategory() == EmailCategory.DENY).collect(Collectors.toList())) {
                if (withNote(rejectOption, userDTO, actionId))
                    layoutBlocks.add(buildPlainTextBlock(rejectOption.getExpandedNote().orElse(null), rejectOption.getBlockId().orElse(null)));
            }
        }

        return layoutBlocks;
    }

    private LayoutBlock buildActionBlock(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId) {
        List<BlockElement> actionElements = new ArrayList<>();

        // Add button - Approve
        if (!userDTO.isActivated()) {
            actionElements.add(buildApproveButton(userDTO));
        }

        // Add select element - More Actions
        actionElements.add(buildMoreActionsDropdown(userDTO, trialAccountActivated, actionId));

        return ActionsBlock.builder().elements(actionElements).build();
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

    private ButtonElement buildApproveButton(UserDTO user) {
        ButtonElement button = buildPrimaryButton("Approve", user.getLogin(), APPROVE_USER);
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to approve a commercial account."));
        }
        return button;
    }

    private StaticSelectElement buildMoreActionsDropdown(UserDTO user, boolean trialAccountActivated, ActionId actionId) {
        List<OptionGroupObject> optionGroups = new ArrayList<>();

        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            // Add option group - Trial
            List<OptionObject> trialGroup = new ArrayList<>();
            // Add option - Give Trial Access
            if (!withNote(DropdownEmailOption.GIVE_TRIAL_ACCESS, user, actionId) && !user.isActivated()) {
                trialGroup.add(buildEmailOption(DropdownEmailOption.GIVE_TRIAL_ACCESS, user));
            }
            // Add option - Convert to regular
            if (trialAccountActivated) {
                trialGroup.add(buildConvertToRegularAccountOption(user));
            }
            if (!trialGroup.isEmpty()) {
                optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("Trial").build()).options(trialGroup).build());
            }

            // Add option group - License
            List<OptionObject> licenseGroup = new ArrayList<>();
            for (DropdownEmailOption licenseOption: Arrays.stream(DropdownEmailOption.values()).filter(mo -> mo.getCategory() == EmailCategory.LICENSE).collect(Collectors.toList())) {
                licenseGroup.add(buildEmailOption(licenseOption, user));
            }
            optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("License").build()).options(licenseGroup).build());
        }

        if (!user.isActivated()) {
            // Add option group - Clarify
            List<OptionObject> clarifyGroup = new ArrayList<>();
            for (DropdownEmailOption clarifyOption : Arrays.stream(DropdownEmailOption.values()).filter(mo -> mo.getCategory() == EmailCategory.CLARIFY).collect(Collectors.toList())) {
                clarifyGroup.add(buildEmailOption(clarifyOption, user));
            }
            optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("Clarify").build()).options(clarifyGroup).build());

            // Add option group - Deny
            List<OptionObject> denyGroup = new ArrayList<>();
            for (DropdownEmailOption denyOption : Arrays.stream(DropdownEmailOption.values()).filter(mo -> mo.getCategory() == EmailCategory.DENY).collect(Collectors.toList())) {
                denyGroup.add(buildEmailOption(denyOption, user));
            }
            optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("Deny").build()).options(denyGroup).build());
        }

        // Add option group - Other
        List<OptionObject> otherGroup = new ArrayList<>();
        // Add option - Collapse
        otherGroup.add(buildCollapseOption(user));
        // Add option - Update Info
        otherGroup.add(buildUpdateUserOption(user));
        optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("Other").build()).options(otherGroup).build());

        StaticSelectElement dropdown = StaticSelectElement.builder().actionId(MORE_ACTIONS.getId()).placeholder(PlainTextObject.builder().text("More Actions").build()).optionGroups(optionGroups).build();
        dropdown.setConfirm(buildConfirmationDialogObject("Please check that the correct action has been selected."));
        return dropdown;
    }

    private OptionObject buildEmailOption(DropdownEmailOption mailOption, UserDTO user) {
        return OptionObject.builder().value(getOptionValue(mailOption.getActionId().toString(), user.getLogin())).text(PlainTextObject.builder().text(mailOption.getDropdownKey()).build()).build();
    }

    private OptionObject buildConvertToRegularAccountOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(CONVERT_TO_REGULAR_ACCOUNT.toString(), user.getLogin())).text(PlainTextObject.builder().text("Convert To Regular Account").build()).build();
    }

    private OptionObject buildCollapseOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(COLLAPSE.toString(), user.getLogin())).text(PlainTextObject.builder().text("Collapse").build()).build();
    }

    private OptionObject buildUpdateUserOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(UPDATE_USER.toString(), user.getLogin())).text(PlainTextObject.builder().text("Update Info Above").build()).build();
    }

    public ActionId getActionIdFromMoreActions(BlockActionPayload blockActionPayload) {
        if (blockActionPayload != null) {
            BlockActionPayload.Action action = getAction(blockActionPayload, MORE_ACTIONS).orElse(null);
            return ActionId.valueOf(getOptionValueArgument(action.getSelectedOption().getValue()));
        }
        return null;
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

    private void sendModal(String triggerId, View view) {
        ViewsOpenRequest request = ViewsOpenRequest.builder()
            .token(applicationProperties.getSlack().getSlackBotOauthToken())
            .triggerId(triggerId)
            .view(view)
            .build();

        Slack slack = Slack.getInstance();
        try {
            ViewsOpenResponse response = slack.methods().viewsOpen(request);
            if (!response.isOk()) {
                log.info("Send the modal to slack with error " + response.getError() + ". Response meta data message: " + response.getResponseMetadata().getMessages());
            } else {
                log.info("Sent the modal to slack");
            }
        } catch (Exception e) {
            log.warn("Failed to send modal to slack");
        }
    }

    private View buildModalView(UserDTO userDTO, ActionId actionId, String responseUrl) {
        Optional<DropdownEmailOption> mailOption = Arrays.stream(DropdownEmailOption.values()).filter(mo -> mo.getActionId() == actionId).findAny();

        final String DEFAULT_SUBJECT = "License for " + userDTO.getLicenseType().getName() + " of OncoKB";
        final String COMPANY_LICENSE_SUBJECT = "OncoKB - " + userDTO.getCompanyName() + " license options";
        final String GREETING = "Dear " + userDTO.getFirstName() + ' ' + userDTO.getLastName() + ",\n\n" +
            "Thank you for your interest in the " + userDTO.getLicenseType().getName() + " license for OncoKB.\n\n";
        final String CLOSING = "\nSincerely,\nThe OncoKB Team";

        List<LayoutBlock> layoutBlocks = new ArrayList<>();
        ViewTitle title = ViewTitle.builder().type(PlainTextObject.TYPE).build(); // Max 24 characters
        String callbackId = null;
        String subject = null;
        StringBuilder bodySb = new StringBuilder().append(GREETING);
        if (mailOption.isPresent()) {
            try {
                title.setText(mailOption.get().getModalTitle().orElse(""));
                callbackId = mailOption.get().getConfirmActionId().isPresent() ? mailOption.get().getConfirmActionId().get().getId() : "";
                subject = mailOption.get().getModalSubject().get().equals(EmailSubject.DEFAULT) ? DEFAULT_SUBJECT : COMPANY_LICENSE_SUBJECT;
                bodySb.append(getStringFromResourceTemplateMailTextFile(mailOption.get().getMailType().getStringTemplateName().orElse("")));
            } catch (Exception e) {
                log.warn("Unable to find email template file");
            }
        }
        bodySb.append(CLOSING);

        layoutBlocks.add(InputBlock.builder()
            .label(PlainTextObject.builder().text("Subject").build())
            .element(PlainTextInputElement.builder().initialValue(subject).actionId(INPUT_SUBJECT.getId()).build())
            .blockId(SUBJECT_INPUT.getId())
            .build());
        layoutBlocks.add(InputBlock.builder()
            .label(PlainTextObject.builder().text("Body").build())
            .element(PlainTextInputElement.builder().multiline(true).initialValue(bodySb.toString()).actionId(INPUT_BODY.getId()).build())
            .blockId(BODY_INPUT.getId())
            .build());
        return View.builder()
            .type("modal")
            .title(title)
            .blocks(layoutBlocks)
            .submit(ViewSubmit.builder().type(PlainTextObject.TYPE).text("Send").build())
            .callbackId(callbackId)
            .privateMetadata(getOptionValue(responseUrl, userDTO.getLogin()))
            .build();
    }

    private LayoutBlock buildPlainTextBlock(String text, BlockId blockId) {
        if (text != null && blockId != null) {
            return SectionBlock.builder().text(PlainTextObject.builder().text(text).build()).blockId(blockId.getId()).build();
        }
        return null;
    }

    private String getStringFromResourceTemplateMailTextFile(String fileName) {
        StringBuilder sb = new StringBuilder();

        URL targetFileUrl = getClass().getClassLoader().getResource("templates/mail/" + fileName);
        if (targetFileUrl != null) {
            try (Stream<String> stream = Files.lines(Paths.get(targetFileUrl.getPath()), StandardCharsets.UTF_8)) {
                stream.forEach(s -> sb.append(s).append("\n"));
            } catch (Exception e) {
                log.warn("Failed to get string from text file");
            }
        }

        return sb.toString();
    }

    private Optional<LayoutBlock> getBlockWithId(List<LayoutBlock> blocks, BlockId blockId) {
        for (LayoutBlock block : blocks) {
            if (block.getClass().getName().equals("com.slack.api.model.block.SectionBlock")) {
                SectionBlock sectionBlock = (SectionBlock) block;
                if (Objects.nonNull(sectionBlock.getBlockId())) {
                    if((BlockId.isSummaryNote(BlockId.getById(sectionBlock.getBlockId())))
                        || sectionBlock.getBlockId().equals(blockId.getId())) {
                        return Optional.of(block);
                    }
                }
            } else if (block.getClass().getName().equals("com.slack.api.model.block.ContextBlock")) {
                ContextBlock contextBlock = (ContextBlock) block;
                if (Objects.nonNull(contextBlock.getBlockId())) {
                    if ((BlockId.isSummaryNote(BlockId.getById(contextBlock.getBlockId())))
                        || contextBlock.getBlockId().equals(blockId.getId())) {
                        return Optional.of(block);
                    }
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
