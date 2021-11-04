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
import org.mskcc.cbio.oncokb.domain.UserIdMessagePair;
import org.mskcc.cbio.oncokb.domain.enumeration.*;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    public void sendUserRegistrationToChannel(UserDTO user, boolean trialAccountActivated) {
        withAcademicClarificationNote(user, null,  true);

        log.debug("Sending notification to admin group that a user has registered a new account");
        if (StringUtils.isEmpty(this.applicationProperties.getSlack().getUserRegistrationWebhook())) {
            log.debug("\tSkipped, the webhook is not configured");
        } else {
            List<LayoutBlock> layoutBlocks = this.buildBlocks(user, trialAccountActivated, null);
            this.sendBlocks(this.applicationProperties.getSlack().getUserRegistrationWebhook(), layoutBlocks);
        }
    }

    @Async
    public void sendLatestBlocks(String url, UserDTO userDTO, boolean trialAccountActivated, ActionId actionId, String triggerId) {
        if (ActionId.isEmailAction(actionId)) {
            this.sendModal(triggerId, this.buildModalView(userDTO, actionId, url));
        } else {
            this.sendBlocks(url, this.buildBlocks(userDTO, trialAccountActivated, actionId));
        }
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
                    if (!(getBlockWithId(message.getBlocks(), COLLAPSED).isPresent() || getBlockWithId(message.getBlocks(), SUMMARY_NOTE).isPresent())
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

    public List<LayoutBlock> buildBlocks(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId) {
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
            blocks.addAll(buildExpandedBlocks(userDTO, trialAccountActivated, actionId));
        }

        // Add message divider
        blocks.add(DividerBlock.builder().build());

        return blocks;
    }

    private LayoutBlock buildCollapsedBlock(UserDTO userDTO, ActionId actionId) {
        StringBuilder sb = new StringBuilder();
        sb.append(userDTO.getEmail() + "\n" + userDTO.getCompany() + " (" + userDTO.getLicenseType().getShortName() + (withTrialAccountNote(userDTO, actionId) ? ", *TRIAL*)" : userDTO.isActivated() ? ")" : ")\n*NOT ACTIVATED*: "));
        if (!userDTO.isActivated()) {
            if (withRejectionNote(userDTO, actionId)) {
                sb.append("Sent rejection email");
            } else if (withRejectAlumniAddressNote(userDTO, actionId)) {
                sb.append("Rejected user due to alumni email address");
            } else if (withUseCaseClarificationNote(userDTO, actionId)) {
                sb.append("Sent use case clarification");
            } else if (withForProfitClarificationNote(userDTO, actionId)) {
                sb.append("Clarified with user on for-profit affiliation");
            } else if (withAcademicClarificationNote(userDTO, actionId, false)) {
                sb.append("Clarified with user on noninstitutional email");
            } else if (withDuplicateUserClarificationNote(userDTO, actionId)) {
                sb.append("Clarified with user on multiple account request");
            } else {
                sb.append("Collapsed");
            }
        }
        return SectionBlock.builder()
            .text(MarkdownTextObject.builder().text(sb.toString()).build())
            .accessory(buildExpandButton(userDTO)).blockId(COLLAPSED.getId()).build();
    }

    private List<LayoutBlock> buildExpandedBlocks(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId) {
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
        blocks.add(buildAccountStatusBlock(userDTO, withTrialAccountNote(userDTO, actionId)));

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
        if (StringUtils.isNotEmpty(userDTO.getCompany())) {
            sb.append("*" + userDTO.getCompany() + "*");
        }

        return SectionBlock.builder().text(MarkdownTextObject.builder().text(sb.toString()).build()).accessory(getLicenseTypeElement(userDTO)).blockId(LICENSE_TYPE.getId()).build();
    }

    private LayoutBlock buildAccountStatusBlock(UserDTO userDTO, boolean isTrialAccountActivated) {
        List<TextObject> userInfo = new ArrayList<>();

        // Add account information
        userInfo.add(getTextObject("Account Status", userDTO.isActivated() ? "Activated" : (StringUtils.isNotEmpty(userDTO.getActivationKey()) ? "Email not validated" : "Not Activated")));
        userInfo.add(getTextObject("Account Type", isTrialAccountActivated ? "TRIAL" : "REGULAR"));
        if (isTrialAccountActivated) {
            userInfo.add(getTextObject("Trial Expires On", toNYZoneTime(userDTO.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate().plusSeconds(DAY_IN_SECONDS * 90))));
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

    public boolean withTrialAccountNote(UserDTO userDTO, ActionId actionId) {
        if (
            userDTO.getAdditionalInfo() == null
                || userDTO.getAdditionalInfo().getTrialAccount() == null
                || userDTO.getAdditionalInfo().getTrialAccount().getActivation() == null
        ) {
            return false;
        }
        return StringUtils.isNotEmpty(userDTO.getAdditionalInfo().getTrialAccount().getActivation().getKey()) || userDTO.getAdditionalInfo().getTrialAccount().getActivation().getActivationDate() != null
            || actionId == GIVE_TRIAL_ACCESS;
    }

    private boolean withForProfitClarificationNote(UserDTO userDTO, ActionId actionId) {
        return !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.CLARIFY_ACADEMIC_FOR_PROFIT, null).isEmpty()
            || actionId == CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL;
    }

    private boolean withAcademicClarificationNote(UserDTO userDTO, ActionId actionId, boolean newUserActivation) {
        boolean withAcademicClarificationNote = false;
        if (userDTO.getLicenseType().equals(LicenseType.ACADEMIC)) {
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
                if (withAcademicClarificationNote && newUserActivation) {
                    mailService.sendAcademicClarificationEmail(userDTO);
                }
            } else if (!newUserActivation && !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, null).isEmpty()) {
                withAcademicClarificationNote = true;
            }
        }
        return withAcademicClarificationNote
            || actionId == CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL;
    }

    private boolean withUseCaseClarificationNote(UserDTO userDTO, ActionId actionId) {
        return !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.CLARIFY_USE_CASE, null).isEmpty()
            || actionId == CONFIRM_SEND_USE_CASE_CLARIFICATION_EMAIL;
    }

    private boolean withDuplicateUserClarificationNote(UserDTO userDTO, ActionId actionId) {
        return !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.CLARIFY_DUPLICATE_USER, null).isEmpty()
            || actionId == CONFIRM_SEND_DUPLICATE_USER_CLARIFICATION_EMAIL;
    }

    private boolean withRejectionNote(UserDTO userDTO, ActionId actionId) {
        return !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.REJECTION, null).isEmpty()
            || actionId == CONFIRM_SEND_REJECTION_EMAIL;
    }

    private boolean withRejectAlumniAddressNote(UserDTO userDTO, ActionId actionId) {
        return !userMailsService.findUserMailsByUserAndMailTypeAndSentDateAfter(userMapper.userDTOToUser(userDTO), MailType.REJECT_ALUMNI_ADDRESS, null).isEmpty()
            || actionId == CONFIRM_SEND_REJECT_ALUMNI_ADDRESS_EMAIL;
    }

    private boolean isReviewed(UserDTO userDTO, ActionId actionId) {
        return userDTO.isActivated()
            || withTrialAccountNote(userDTO, actionId)
            || withForProfitClarificationNote(userDTO, actionId)
            || withAcademicClarificationNote(userDTO, actionId, false)
            || withUseCaseClarificationNote(userDTO, actionId)
            || withRejectionNote(userDTO, actionId);
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

    private List<LayoutBlock> buildAdditionalInfoBlocks(UserDTO userDTO, boolean trialAccountActivated, ActionId actionId) {
        List<LayoutBlock> layoutBlocks = new ArrayList<>();

        if (withForProfitClarificationNote(userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("We have sent a clarification email to the user asking why they are applying for the academic license while affiliated with a for-profit company.", FOR_PROFIT_CLARIFICATION_NOTE));
        }
        if (withAcademicClarificationNote(userDTO, actionId, false)) {
            layoutBlocks.add(buildPlainTextBlock("We have sent a clarification email to the user asking why they could not use an institution email to register.", ACADEMIC_CLARIFICATION_NOTE));
        }
        if (withUseCaseClarificationNote(userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("We have sent a clarification email to the user asking to further explain their use case.", USE_CASE_CLARIFICATION_NOTE));
        }
        if (withDuplicateUserClarificationNote(userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("We have sent a clarification email to the user asking why they registered multiple accounts.", DUPLICATE_USER_CLARIFICATION_NOTE));
        }
        if (isMSKUser(userDTO)) {
            layoutBlocks.add(buildPlainTextBlock("The user has been approved and notified automatically. We also changed their license to Academic and clarified with the user.", MSK_USER_NOTE));
        }
        if (userDTO.isActivated() && !trialAccountActivated) {
            if (!withTrialAccountNote(userDTO, actionId)) {
                layoutBlocks.add(buildPlainTextBlock("The user has been approved and notified.", APPROVED_NOTE));
            } else {
                layoutBlocks.add(buildPlainTextBlock("The trial account has been converted to a regular account.", CONVERT_TO_REGULAR_ACCOUNT_NOTE));
            }
        } else if (withTrialAccountNote(userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("The trial account has been initialized and notified.", TRIAL_ACCOUNT_NOTE));
        } else if (withRejectionNote(userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("The user has been rejected and notified.", REJECTION_NOTE));
        } else if (withRejectAlumniAddressNote(userDTO, actionId)) {
            layoutBlocks.add(buildPlainTextBlock("The user has been rejected due to alumni email address", REJECT_ALUMNI_ADDRESS_NOTE));
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
            if (!withTrialAccountNote(user, actionId) && !user.isActivated()) {
                trialGroup.add(buildGiveTrialAccessOption(user));
            }
            // Add option - Convert to regular
            if (trialAccountActivated) {
                trialGroup.add(buildConvertToRegularAccountOption(user));
            }
            if (!trialGroup.isEmpty()) {
                optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("Trial").build()).options(trialGroup).build());
            }
        }

        if (!user.isActivated()) {
            // Add option group - Clarify
            List<OptionObject> clarifyGroup = new ArrayList<>();
            // Add option - Send Academic For Profit Clarification Email
            clarifyGroup.add(buildForProfitClarificationOption(user));
            // Add option - Send Academic Clarification Email
            clarifyGroup.add(buildAcademicClarificationOption(user));
            // Add option - Send Use Case Clarification Email
            clarifyGroup.add(buildUseCaseClarificationOption(user));
            // Add option - Send Duplicate User Clarification Email
            clarifyGroup.add(buildDuplicateUserClarificationOption(user));
            optionGroups.add(OptionGroupObject.builder().label(PlainTextObject.builder().text("Clarify").build()).options(clarifyGroup).build());

            // Add option group - Deny
            List<OptionObject> denyGroup = new ArrayList<>();
            // Add option - Send Rejection Email
            denyGroup.add(buildRejectionOption(user));
            // Add option - Send Reject Alumni Address Email
            denyGroup.add(buildRejectAlumniAddressOption(user));
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

    private OptionObject buildGiveTrialAccessOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(GIVE_TRIAL_ACCESS.toString(), user.getLogin())).text(PlainTextObject.builder().text("Give Trial Access").build()).build();
    }

    private OptionObject buildConvertToRegularAccountOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(CONVERT_TO_REGULAR_ACCOUNT.toString(), user.getLogin())).text(PlainTextObject.builder().text("Convert To Regular Account").build()).build();
    }

    private OptionObject buildForProfitClarificationOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(SEND_ACADEMIC_FOR_PROFIT_EMAIL.toString(), user.getLogin())).text(PlainTextObject.builder().text("Send Academic For Profit Email").build()).build();
    }

    private OptionObject buildAcademicClarificationOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(SEND_ACADEMIC_CLARIFICATION_EMAIL.toString(), user.getLogin())).text(PlainTextObject.builder().text("Send Academic Domain Clarification Email").build()).build();
    }

    private OptionObject buildUseCaseClarificationOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(SEND_USE_CASE_CLARIFICATION_EMAIL.toString(), user.getLogin())).text(PlainTextObject.builder().text("Send Use Case Clarification Email").build()).build();
    }

    private OptionObject buildDuplicateUserClarificationOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(SEND_DUPLICATE_USER_CLARIFICATION_EMAIL.toString(), user.getLogin())).text(PlainTextObject.builder().text("Send Duplicate User Email").build()).build();
    }

    private OptionObject buildRejectionOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(SEND_REJECTION_EMAIL.toString(), user.getLogin())).text(PlainTextObject.builder().text("Send Rejection Email").build()).build();
    }

    private OptionObject buildRejectAlumniAddressOption(UserDTO user) {
        return OptionObject.builder().value(getOptionValue(SEND_REJECT_ALUMNI_ADDRESS_EMAIL.toString(), user.getLogin())).text(PlainTextObject.builder().text("Send Alumni Rejection Email").build()).build();
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
                log.info("Send the modal to slack with error " + response.getError());
            } else {
                log.info("Send the modal to slack");
            }
        } catch (Exception e) {
            log.warn("Failed to send modal to slack");
        }
    }

    private View buildModalView(UserDTO userDTO, ActionId actionId, String responseUrl) {
        final String SUBJECT = "License for " + userDTO.getLicenseType().getName() + " of OncoKB";
        final String GREETING = "Dear " + userDTO.getFirstName() + ' ' + userDTO.getLastName() + ",\n\n" +
            "Thank you for your interest in the " + userDTO.getLicenseType().getName() + " license for OncoKB.\n\n";
        final String CLOSING = "\nSincerely,\nThe OncoKB Team";

        List<LayoutBlock> layoutBlocks = new ArrayList<>();
        ViewTitle title = ViewTitle.builder().type(PlainTextObject.TYPE).build(); // Max 24 characters
        String callbackId = null;
        StringBuilder sb = new StringBuilder().append(GREETING);
        try {
            switch (actionId) {
                case SEND_ACADEMIC_FOR_PROFIT_EMAIL:
                    title.setText("For Profit Clarification");
                    callbackId = CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL.getId();
                    sb.append(getStringFromTextFile("src/main/resources/templates/mail/clarifyLicenseInForProfileCompanyString.txt"));
                    break;
                case SEND_ACADEMIC_CLARIFICATION_EMAIL:
                    title.setText("Domain Clarification");
                    callbackId = CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL.getId();
                    sb.append(getStringFromTextFile("src/main/resources/templates/mail/clarifyAcademicUseWithoutInstituteEmailString.txt"));
                    break;
                case SEND_USE_CASE_CLARIFICATION_EMAIL:
                    title.setText("Use Case Clarification");
                    callbackId = CONFIRM_SEND_USE_CASE_CLARIFICATION_EMAIL.getId();
                    sb.append(getStringFromTextFile("src/main/resources/templates/mail/clarifyUseCaseString.txt"));
                    break;
                case SEND_DUPLICATE_USER_CLARIFICATION_EMAIL:
                    title.setText("Clarify duplicate user");
                    callbackId = CONFIRM_SEND_DUPLICATE_USER_CLARIFICATION_EMAIL.getId();
                    sb.append(getStringFromTextFile("src/main/resources/templates/mail/clarifyDuplicateUserString.txt"));
                    break;
                case SEND_REJECTION_EMAIL:
                    title.setText("Rejection Email");
                    callbackId = CONFIRM_SEND_REJECTION_EMAIL.getId();
                    sb.append(getStringFromTextFile("src/main/resources/templates/mail/rejectionEmailString.txt"));
                    break;
                case SEND_REJECT_ALUMNI_ADDRESS_EMAIL:
                    title.setText("Reject Alumni Address");
                    callbackId = CONFIRM_SEND_REJECT_ALUMNI_ADDRESS_EMAIL.getId();
                    sb.append(getStringFromTextFile("src/main/resources/templates/mail/alumniEmailAddressString.txt"));
                    break;
            }
        } catch (Exception e) {
            log.warn("Unable to find email template file");
        }
        sb.append(CLOSING);

        layoutBlocks.add(InputBlock.builder()
            .label(PlainTextObject.builder().text("Subject").build())
            .element(PlainTextInputElement.builder().initialValue(SUBJECT).actionId(INPUT_SUBJECT.getId()).build())
            .blockId(SUBJECT_INPUT.getId())
            .build());
        layoutBlocks.add(InputBlock.builder()
            .label(PlainTextObject.builder().text("Body").build())
            .element(PlainTextInputElement.builder().multiline(true).initialValue(sb.toString()).actionId(INPUT_BODY.getId()).build())
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
        return SectionBlock.builder().text(PlainTextObject.builder().text(text).build()).blockId(blockId.getId()).build();
    }

    private String getStringFromTextFile(String filePath) {
        StringBuilder sb = new StringBuilder();

        try (Stream<String> stream = Files.lines(Paths.get(filePath), StandardCharsets.UTF_8)) {
            stream.forEach(s -> sb.append(s).append("\n"));
        }
        catch (Exception e) {
            log.warn("Failed to get string from text file");
        }

        return sb.toString();
    }

    private Optional<LayoutBlock> getBlockWithId(List<LayoutBlock> blocks, BlockId blockId) {
        for (LayoutBlock block : blocks) {
            if (block.getClass().getName().equals("com.slack.api.model.block.SectionBlock")) {
                SectionBlock sectionBlock = (SectionBlock) block;
                if (Objects.nonNull(sectionBlock.getBlockId())) {
                    if((blockId == SUMMARY_NOTE && BlockId.isSummaryNote(BlockId.getById(sectionBlock.getBlockId())))
                        || sectionBlock.getBlockId().equals(blockId.getId())) {
                        return Optional.of(block);
                    }
                }
            } else if (block.getClass().getName().equals("com.slack.api.model.block.ContextBlock")) {
                ContextBlock contextBlock = (ContextBlock) block;
                if (Objects.nonNull(contextBlock.getBlockId())) {
                    if ((blockId == SUMMARY_NOTE && BlockId.isSummaryNote(BlockId.getById(contextBlock.getBlockId())))
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
