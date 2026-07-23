package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.mskcc.cbio.oncokb.domain.MailTypeInfo;

public class SendEmailPageResponseDTO implements Serializable {
    private List<SendEmailUserOptionDTO> users = new ArrayList<>();
    private List<MailTypeInfo> mailTypes = new ArrayList<>();

    public List<SendEmailUserOptionDTO> getUsers() {
        return users;
    }

    public void setUsers(List<SendEmailUserOptionDTO> users) {
        this.users = users;
    }

    public List<MailTypeInfo> getMailTypes() {
        return mailTypes;
    }

    public void setMailTypes(List<MailTypeInfo> mailTypes) {
        this.mailTypes = mailTypes;
    }
}
