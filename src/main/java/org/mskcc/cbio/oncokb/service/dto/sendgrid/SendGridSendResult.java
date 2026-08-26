package org.mskcc.cbio.oncokb.service.dto.sendgrid;

public class SendGridSendResult {
    private int statusCode;
    private String messageId;

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }
}
