package org.mskcc.cbio.oncokb.service.dto.sendgrid;

import java.util.ArrayList;
import java.util.List;

public class SendGridMailRequest {
    private String fromEmail;
    private String templateId;
    private Long asmGroupId;
    private List<Long> groupsToDisplay = new ArrayList<>();
    private List<SendGridRecipient> recipients = new ArrayList<>();

    public String getFromEmail() {
        return fromEmail;
    }

    public void setFromEmail(String fromEmail) {
        this.fromEmail = fromEmail;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public Long getAsmGroupId() {
        return asmGroupId;
    }

    public void setAsmGroupId(Long asmGroupId) {
        this.asmGroupId = asmGroupId;
    }

    public List<Long> getGroupsToDisplay() {
        return groupsToDisplay;
    }

    public void setGroupsToDisplay(List<Long> groupsToDisplay) {
        this.groupsToDisplay = groupsToDisplay;
    }

    public List<SendGridRecipient> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<SendGridRecipient> recipients) {
        this.recipients = recipients;
    }
}
