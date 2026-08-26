package org.mskcc.cbio.oncokb.service.dto.sendgrid;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SendGridMailSendPayload {
    private EmailAddress from;
    @JsonProperty("template_id")
    private String templateId;
    private List<Personalization> personalizations = new ArrayList<>();
    private Asm asm;

    public EmailAddress getFrom() {
        return from;
    }

    public void setFrom(EmailAddress from) {
        this.from = from;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public List<Personalization> getPersonalizations() {
        return personalizations;
    }

    public void setPersonalizations(List<Personalization> personalizations) {
        this.personalizations = personalizations;
    }

    public Asm getAsm() {
        return asm;
    }

    public void setAsm(Asm asm) {
        this.asm = asm;
    }

    public static class EmailAddress {
        private String email;

        public EmailAddress() {
        }

        public EmailAddress(String email) {
            this.email = email;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Personalization {
        private List<EmailAddress> to = new ArrayList<>();
        private List<EmailAddress> cc;
        @JsonProperty("dynamic_template_data")
        private Map<String, Object> dynamicTemplateData = new LinkedHashMap<>();

        public List<EmailAddress> getTo() {
            return to;
        }

        public void setTo(List<EmailAddress> to) {
            this.to = to;
        }

        public List<EmailAddress> getCc() {
            return cc;
        }

        public void setCc(List<EmailAddress> cc) {
            this.cc = cc;
        }

        public Map<String, Object> getDynamicTemplateData() {
            return dynamicTemplateData;
        }

        public void setDynamicTemplateData(Map<String, Object> dynamicTemplateData) {
            this.dynamicTemplateData = dynamicTemplateData;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Asm {
        @JsonProperty("group_id")
        private Long groupId;
        @JsonProperty("groups_to_display")
        private List<Long> groupsToDisplay;

        public Long getGroupId() {
            return groupId;
        }

        public void setGroupId(Long groupId) {
            this.groupId = groupId;
        }

        public List<Long> getGroupsToDisplay() {
            return groupsToDisplay;
        }

        public void setGroupsToDisplay(List<Long> groupsToDisplay) {
            this.groupsToDisplay = groupsToDisplay;
        }
    }
}
