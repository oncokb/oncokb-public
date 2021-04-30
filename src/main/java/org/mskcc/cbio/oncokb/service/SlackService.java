package org.mskcc.cbio.oncokb.service;

import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.model.block.ActionsBlock;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.ConfirmationDialogObject;
import com.slack.api.model.block.composition.MarkdownTextObject;
import com.slack.api.model.block.composition.PlainTextObject;
import com.slack.api.model.block.composition.TextObject;
import com.slack.api.model.block.element.ButtonElement;
import com.slack.api.webhook.Payload;
import com.slack.api.webhook.WebhookResponse;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.domain.enumeration.ProjectProfile;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.useradditionalinfo.AdditionalInfoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static org.mskcc.cbio.oncokb.config.Constants.EXPIRATION;
import static org.mskcc.cbio.oncokb.config.Constants.MAIL_LICENSE;
import static org.mskcc.cbio.oncokb.util.TimeUtil.toNYZoneTime;


/**
 * Service for sending account approval info to slack.
 * <p>
 * We use the {@link Async} annotation to send slack messages asynchronously.
 */
@Service
public class SlackService {

    private final Logger log = LoggerFactory.getLogger(SlackService.class);

    private static final String APPROVE_USER = "approve-user";
    private static final String GIVE_TRIAL_ACCESS = "give-trial-access";

    private static final String ACADEMIC_CLARIFICATION_NOTE = "We have sent the clarification email to the user asking why they could not use an institution email to register.";
    private static final String LICENSED_DOMAIN_APPROVE_NOTE = ":star: *This email domain belongs to a licensed company. Please review and approve accordingly.*";
    private static final String TRIALED_DOMAIN_APPROVE_NOTE = ":bangbang: *This email domain belongs to a company that has trial license. The account will be approved by the IT team.*";

    private final ApplicationProperties applicationProperties;
    private final MailService mailService;
    private final EmailService emailService;

    public SlackService(ApplicationProperties applicationProperties, MailService mailService, EmailService emailService) {
        this.applicationProperties = applicationProperties;
        this.mailService = mailService;
        this.emailService = emailService;
    }

    @Async
    public void sendUserRegistrationToChannel(UserDTO user) {
        log.debug("Sending notification to admin group that a user has registered a new account");
        if (StringUtils.isEmpty(this.applicationProperties.getUserRegistrationWebhook())) {
            log.debug("\tSkipped, the webhook is not configured");
        } else {
            List<LayoutBlock> layoutBlocks = new ArrayList<>();
            if (user.getLicenseType().equals(LicenseType.ACADEMIC)) {
                boolean withClarificationNote = false;
                if (this.applicationProperties.getAcademicEmailClarifyDomains().size() > 0 &&
                    this.applicationProperties.getAcademicEmailClarifyDomains().stream().filter(domain -> user.getEmail().endsWith(domain)).collect(Collectors.toList()).size() > 0) {
                    withClarificationNote = true;
                    mailService.sendEmailWithLicenseContext(user, MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, applicationProperties.getEmailAddresses().getLicenseAddress(), null, null);
                }
                layoutBlocks = buildAcademicBlocks(user, withClarificationNote);
            } else {
                boolean domainIsLicensed = false;
                boolean domainIsTrialed = false;
                List<String> licensedDomains = applicationProperties.getLicensedDomainsList();
                if (!licensedDomains.isEmpty() && licensedDomains.stream().anyMatch(domain -> emailService.getEmailDomain(user.getEmail().toLowerCase()).equals(domain.toLowerCase()))) {
                    domainIsLicensed = true;
                }
                List<String> trialedDomains = applicationProperties.getTrialedDomainsList();
                if (!trialedDomains.isEmpty() && trialedDomains.stream().anyMatch(domain -> emailService.getEmailDomain(user.getEmail().toLowerCase()).equals(domain.toLowerCase()))) {
                    domainIsTrialed = true;
                }

                layoutBlocks = buildCommercialApprovalBlocks(user, domainIsLicensed, domainIsTrialed);
            }
            Payload payload = Payload.builder()
                .blocks(layoutBlocks)
                .build();

            Slack slack = Slack.getInstance();
            try {
                WebhookResponse response = slack.send(this.applicationProperties.getUserRegistrationWebhook(), payload);
            } catch (Exception e) {
                log.warn("Failed to send message to slack");
            }
        }
    }

    @Async
    public void sendApprovedConfirmation(UserDTO userDTO, BlockActionPayload blockActionPayload) {
        Payload payload = Payload.builder()
            .text(userDTO.getEmail() + " has been approved and notified by " + blockActionPayload.getUser().getName())
            .build();

        Slack slack = Slack.getInstance();
        try {
            WebhookResponse response = slack.send(blockActionPayload.getResponseUrl(), payload);
        } catch (IOException e) {
            log.warn("Failed to send message to slack");
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
            WebhookResponse response = slack.send(this.applicationProperties.getUserRegistrationWebhook(), payload);
        } catch (IOException e) {
            log.warn("Failed to send message to slack");
        }
    }

    @Async
    public void sendConfirmationAfterGivingFreeTrial(UserDTO userDTO) {
        Payload payload = Payload.builder()
            .text(userDTO.getEmail() + " has been notified about the free trial license agreement.")
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
    public void sendApprovedConfirmationForMSKCommercialRequest(UserDTO userDTO, LicenseType registeredLicenseType) {
        Payload payload = Payload.builder()
            .text(userDTO.getEmail() + " has been approved and notified automatically. We also changed their license to Academic and clarified with the user.")
            .build();

        Slack slack = Slack.getInstance();
        try {
            // This is an automatic message when user from whitelist is registered.
            WebhookResponse response = slack.send(this.applicationProperties.getUserRegistrationWebhook(), payload);
            // In this case, we also want to send an email to user to explain
            Context context = new Context();
            context.setVariable(MAIL_LICENSE, registeredLicenseType.getName());
            mailService.sendEmailFromTemplate(userDTO, MailType.APPROVAL_MSK_IN_COMMERCIAL, context);
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

    public Optional<BlockActionPayload.Action> getApproveUserAction(BlockActionPayload blockActionPayload) {
        return getAction(blockActionPayload, APPROVE_USER);
    }

    public Optional<BlockActionPayload.Action> giveTrialAccessAction(BlockActionPayload blockActionPayload) {
        return getAction(blockActionPayload, GIVE_TRIAL_ACCESS);
    }

    private Optional<BlockActionPayload.Action> getAction(BlockActionPayload blockActionPayload, String actionKey) {
        return blockActionPayload.getActions().stream().filter(action -> action.getActionId().equalsIgnoreCase(actionKey)).findFirst();
    }

    private TextObject getTextObject(String title, String content) {
        StringBuilder sb = new StringBuilder();
        sb.append("*" + title + ":*\n");
        sb.append(content);
        return MarkdownTextObject.builder().text(sb.toString()).build();
    }

    private List<LayoutBlock> buildCommercialApprovalBlocks(UserDTO user, boolean licensedDomain, boolean trialDomain) {
        List<LayoutBlock> blocks = new ArrayList<>();
        boolean isApprovedDomain = isApprovedDomain(licensedDomain, trialDomain);

        // Add mention
        if (isApprovedDomain) {
            blocks.add(buildChannelMentionBlock());
            if (licensedDomain)
                blocks.add(SectionBlock.builder().text(MarkdownTextObject.builder().text(LICENSED_DOMAIN_APPROVE_NOTE).build()).build());
            if (trialDomain)
                blocks.add(SectionBlock.builder().text(MarkdownTextObject.builder().text(TRIALED_DOMAIN_APPROVE_NOTE).build()).build());
        } else {
            blocks.add(buildHereMentionBlock());
        }

        // Add Title
        blocks.add(buildTitleBlock(user));

        // Add user info section
        blocks.addAll(buildUserInfoBlocks(user));

        if(!trialDomain) {
            // Add Approve button
            blocks.add(buildApproveButton(user));
            blocks.add(buildGiveTrialAccessButton(user));
        }

        return blocks;
    }

    private boolean isApprovedDomain(boolean licensedDomain, boolean trialDomain) {
        return licensedDomain || trialDomain;
    }

    private List<LayoutBlock> buildAcademicBlocks(UserDTO user, boolean withClarificationNote) {
        List<LayoutBlock> blocks = new ArrayList<>();

        // Add mention
        blocks.add(buildHereMentionBlock());

        // Add Title
        blocks.add(buildTitleBlock(user));

        // Add user info section
        blocks.addAll(buildUserInfoBlocks(user));

        if(withClarificationNote) {
            // Add clarification note
            blocks.add(buildPlainTextBlock(ACADEMIC_CLARIFICATION_NOTE));
        } else {
            // Add Approve button
            blocks.add(buildApproveButton(user));
        }

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

    private LayoutBlock buildTitleBlock(UserDTO user) {
        List<TextObject> title = new ArrayList<>();
        title.add(PlainTextObject.builder().text("The following user registered an " + user.getLicenseType() + " account").build());
        return SectionBlock.builder().fields(title).build();
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

        // Add company information
        blocks.add(SectionBlock.builder().fields(Collections.singletonList(MarkdownTextObject.builder().text(":sunflower: *"+companyName + " Information*").build())).build());
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

        return blocks;
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

    private LayoutBlock buildApproveButton(UserDTO user) {
        ButtonElement button = ButtonElement.builder()
            .text(PlainTextObject.builder().emoji(true).text("Approve").build())
            .style("primary")
            .actionId(APPROVE_USER)
            .value(user.getLogin())
            .build();
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to approve a commercial account."));
        }
        return ActionsBlock.builder().elements(Arrays.asList(button)).build();
    }

    private LayoutBlock buildGiveTrialAccessButton(UserDTO user) {
        ButtonElement button = ButtonElement.builder()
            .text(PlainTextObject.builder().emoji(true).text("Give Trial Access").build())
            .style("primary")
            .actionId(GIVE_TRIAL_ACCESS)
            .value(user.getLogin())
            .build();
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            button.setConfirm(buildConfirmationDialogObject("You are going to give the user 3 month trial period. The user will get notified through email. Once they are ok with the free trial license agreement, their account will be activated."));
        }
        return ActionsBlock.builder().elements(Arrays.asList(button)).build();
    }

    private LayoutBlock buildPlainTextBlock(String text) {
        return SectionBlock.builder().text(PlainTextObject.builder().text(text).build()).build();
    }
}
