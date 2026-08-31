package org.mskcc.cbio.oncokb.service.dto.sendgrid;

import java.util.LinkedHashMap;
import java.util.Map;

public class SendGridRecipient {
    private String toEmail;
    private String ccEmail;
    private Map<String, Object> dynamicTemplateData = new LinkedHashMap<>();

    public String getToEmail() {
        return toEmail;
    }

    public void setToEmail(String toEmail) {
        this.toEmail = toEmail;
    }

    public String getCcEmail() {
        return ccEmail;
    }

    public void setCcEmail(String ccEmail) {
        this.ccEmail = ccEmail;
    }

    public Map<String, Object> getDynamicTemplateData() {
        return dynamicTemplateData;
    }

    public void setDynamicTemplateData(Map<String, Object> dynamicTemplateData) {
        this.dynamicTemplateData = dynamicTemplateData;
    }
}
