package org.mskcc.cbio.oncokb.service;

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
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;


/**
 * Service for sending account approval info to slack.
 * <p>
 * We use the {@link Async} annotation to send slack messages asynchronously.
 */
@Service
public class SlackService {

    private final Logger log = LoggerFactory.getLogger(SlackService.class);

    private static final String APPROVE_USER = "approve-user";

    private final ApplicationProperties applicationProperties;

    public SlackService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Async
    public void sendUserRegistrationToChannel(UserDTO user) {
        log.debug("Sending notification to admin group that a user has registered a new account");
        if (StringUtils.isEmpty(this.applicationProperties.getUserRegistrationWebhook())) {
            log.debug("\tSkipped, the webhook is not configured");
        } else {
            Payload payload = Payload.builder()
                .blocks(buildUserApprovalBlocks(user))
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

    private TextObject getTextObject(String title, String content) {
        StringBuilder sb = new StringBuilder();
        sb.append("*" + title + ":*\n");
        sb.append(content);
        return MarkdownTextObject.builder().text(sb.toString()).build();
    }

    private List<LayoutBlock> buildUserApprovalBlocks(UserDTO user) {

        List<LayoutBlock> blocks = new ArrayList<>();
        blocks.add(SectionBlock.builder().text(MarkdownTextObject.builder().text("<!here>").build()).build());

        // Title
        List<TextObject> title = new ArrayList<>();
        title.add(getTextObject("The following user registered an " + user.getLicenseType() + " account", ""));
        blocks.add(SectionBlock.builder().fields(title).build());


        // User info section
        List<TextObject> userInfo = new ArrayList<>();
        userInfo.add(getTextObject("Email", user.getEmail()));
        userInfo.add(getTextObject("Name", user.getFirstName() + " " + user.getLastName()));
        userInfo.add(getTextObject("Company", user.getCompany()));
        userInfo.add(getTextObject("Job Title", user.getJobTitle()));
        userInfo.add(getTextObject("City", user.getCity()));
        userInfo.add(getTextObject("Country", user.getCountry()));

        blocks.add(SectionBlock.builder().fields(userInfo).build());

        // Approve button
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

        blocks.add(ActionsBlock.builder().elements(Arrays.asList(button)).build());

        return blocks;
    }

}
