package org.mskcc.cbio.oncokb.service.dto.sendgrid;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class SendGridGroupSuppressionsRequest {
    @JsonProperty("recipient_emails")
    private List<String> recipientEmails;

    public List<String> getRecipientEmails() {
        return recipientEmails;
    }

    public void setRecipientEmails(List<String> recipientEmails) {
        this.recipientEmails = recipientEmails;
    }
}
