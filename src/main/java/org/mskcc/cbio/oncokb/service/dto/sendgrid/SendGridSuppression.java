package org.mskcc.cbio.oncokb.service.dto.sendgrid;

public class SendGridSuppression {
    private Long groupId;
    private String groupName;
    private boolean suppressed;

    public SendGridSuppression() {
    }

    public SendGridSuppression(Long groupId, String groupName, boolean suppressed) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.suppressed = suppressed;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public boolean isSuppressed() {
        return suppressed;
    }

    public void setSuppressed(boolean suppressed) {
        this.suppressed = suppressed;
    }
}
