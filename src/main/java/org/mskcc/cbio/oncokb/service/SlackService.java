package org.mskcc.cbio.oncokb.service;

import ch.qos.logback.core.Layout;
import com.github.seratch.jslack.Slack;
import com.github.seratch.jslack.api.model.block.ActionsBlock;
import com.github.seratch.jslack.api.model.block.LayoutBlock;
import com.github.seratch.jslack.api.model.block.SectionBlock;
import com.github.seratch.jslack.api.model.block.composition.ConfirmationDialogObject;
import com.github.seratch.jslack.api.model.block.composition.MarkdownTextObject;
import com.github.seratch.jslack.api.model.block.composition.PlainTextObject;
import com.github.seratch.jslack.api.model.block.composition.TextObject;
import com.github.seratch.jslack.api.model.block.element.ButtonElement;
import com.github.seratch.jslack.api.webhook.Payload;
import com.github.seratch.jslack.api.webhook.WebhookResponse;
import com.github.seratch.jslack.app_backend.interactive_messages.payload.BlockActionPayload;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;


/**
 * Service for sending account approval info to slack.
 * <p>
 * We use the {@link Async} annotation to send slack messages asynchronously.
 */
@Service
public class SlackService {

    private final Logger log = LoggerFactory.getLogger(SlackService.class);

    private static final String APPROVE_USER = "approve-user";

    private static final String ACADEMIC_CLARIFICATION_NOTE = "We have sent the clarification email to the user asking why they could not use an institution email to register.";
    private static final String COMMERCIAL_APPROVE_NOTE = "We have sent the intake form automatically.";

    private final ApplicationProperties applicationProperties;
    private final MailService mailService;

    public SlackService(ApplicationProperties applicationProperties, MailService mailService) {
        this.applicationProperties = applicationProperties;
        this.mailService = mailService;
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
                if (getAcademicEmailClarifyDomains().size() > 0 &&
                    getAcademicEmailClarifyDomains().stream().filter(domain -> user.getEmail().endsWith(domain)).collect(Collectors.toList()).size() > 0) {
                    withClarificationNote = true;
                    mailService.sendEmailFromTemplate(user, MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL, applicationProperties.getEmailAddresses().getLicenseAddress(), null, null);
                }
                layoutBlocks = buildAcademicBlocks(user, withClarificationNote);
            } else {
                layoutBlocks = buildCommercialApprovalBlocks(user);
                // Send intake form email
                MailType intakeEmailMailType = mailService.getIntakeFormMailType(user.getLicenseType());
                if (intakeEmailMailType != null) {
                    mailService.sendEmailFromTemplate(user, intakeEmailMailType, applicationProperties.getEmailAddresses().getLicenseAddress(), null, null);
                }
            }
            Payload payload = Payload.builder()
                .blocks(layoutBlocks)
                .build();

            Slack slack = Slack.getInstance();
            try {
                WebhookResponse response = slack.send(this.applicationProperties.getUserRegistrationWebhook(), payload);
            } catch (IOException e) {
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

    public Optional<BlockActionPayload.Action> getApproveUserAction(BlockActionPayload blockActionPayload) {
        return blockActionPayload.getActions().stream().filter(action -> action.getActionId().equalsIgnoreCase(APPROVE_USER)).findFirst();
    }

    private List<String> getAcademicEmailClarifyDomains() {
        return Arrays.stream(applicationProperties.getAcademicEmailClarifyDomain().split(",")).map(domain -> domain.trim()).collect(Collectors.toList());
    }

    private TextObject getTextObject(String title, String content) {
        StringBuilder sb = new StringBuilder();
        sb.append("*" + title + ":*\n");
        sb.append(content);
        return MarkdownTextObject.builder().text(sb.toString()).build();
    }

    private List<LayoutBlock> buildCommercialApprovalBlocks(UserDTO user) {
        List<LayoutBlock> blocks = new ArrayList<>();

        // Add mention
        blocks.add(buildHereMentionBlock());

        // Add Title
        blocks.add(buildTitleBlock(user));

        // Add user info section
        blocks.add(buildUserInfoBlock(user));

        // Add Approve button
        blocks.add(buildApproveButton(user));

        // Add Approve button
        blocks.add(buildPlainTextBlock(COMMERCIAL_APPROVE_NOTE));

        return blocks;
    }

    private List<LayoutBlock> buildAcademicBlocks(UserDTO user, boolean withClarificationNote) {
        List<LayoutBlock> blocks = new ArrayList<>();

        // Add mention
        blocks.add(buildHereMentionBlock());

        // Add Title
        blocks.add(buildTitleBlock(user));

        // Add user info section
        blocks.add(buildUserInfoBlock(user));

        if(withClarificationNote) {
            // Add clarification note
            blocks.add(buildPlainTextBlock(ACADEMIC_CLARIFICATION_NOTE));
        } else {
            // Add Approve button
            blocks.add(buildPlainTextBlock(COMMERCIAL_APPROVE_NOTE));
        }

        return blocks;
    }

    private LayoutBlock buildHereMentionBlock() {
        return SectionBlock.builder().text(MarkdownTextObject.builder().text("<!here>").build()).build();
    }

    private LayoutBlock buildTitleBlock(UserDTO user) {
        List<TextObject> title = new ArrayList<>();
        title.add(getTextObject("The following user registered an " + user.getLicenseType() + " account", ""));
        return SectionBlock.builder().fields(title).build();
    }

    private LayoutBlock buildUserInfoBlock(UserDTO user) {
        List<TextObject> userInfo = new ArrayList<>();
        userInfo.add(getTextObject("Email", user.getEmail()));
        userInfo.add(getTextObject("Name", user.getFirstName() + " " + user.getLastName()));
        userInfo.add(getTextObject("Company", user.getCompany()));
        userInfo.add(getTextObject("Job Title", user.getJobTitle()));
        userInfo.add(getTextObject("City", user.getCity()));
        userInfo.add(getTextObject("Country", user.getCountry()));

        return SectionBlock.builder().fields(userInfo).build();
    }

    private LayoutBlock buildApproveButton(UserDTO user) {
        ButtonElement button = ButtonElement.builder()
            .text(PlainTextObject.builder().emoji(true).text("Approve").build())
            .style("primary")
            .actionId(APPROVE_USER)
            .value(user.getLogin())
            .build();
        if (user.getLicenseType() != LicenseType.ACADEMIC) {
            ConfirmationDialogObject confirmationDialogObject = ConfirmationDialogObject.builder()
                .title(PlainTextObject.builder().text("Are you sure?").build())
                .text(PlainTextObject.builder().text("You are going to approve a commercial account.").build())
                .confirm(PlainTextObject.builder().text("Yes").build())
                .deny(PlainTextObject.builder().text("No").build())
                .build();
            button.setConfirm(confirmationDialogObject);
        }
        return ActionsBlock.builder().elements(Arrays.asList(button)).build();
    }

    private LayoutBlock buildPlainTextBlock(String text) {
        return SectionBlock.builder().text(PlainTextObject.builder().text(text).build()).build();
    }
}
