package org.mskcc.cbio.oncokb.domain;

import org.mskcc.cbio.oncokb.domain.enumeration.MailType;

/**
 * Created by Hongxin Zhang on 12/31/19.
 */
public class MailTypeInfo {
    MailType mailType;
    String description;

    public MailTypeInfo(MailType mailType) {
        this.mailType = mailType;
        this.description = mailType.getDescription();
    }

    public MailType getMailType() {
        return mailType;
    }

    public void setMailType(MailType mailType) {
        this.mailType = mailType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
