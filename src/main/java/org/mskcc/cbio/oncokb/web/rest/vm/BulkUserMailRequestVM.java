package org.mskcc.cbio.oncokb.web.rest.vm;

import org.mskcc.cbio.oncokb.domain.enumeration.BulkEmailAudience;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class BulkUserMailRequestVM {
    @NotBlank
    private String from;

    private String cc;

    @NotBlank
    private String by;

    @NotNull
    private BulkEmailAudience audience = BulkEmailAudience.CUSTOM;

    private List<String> recipients;

    private Map<String, Object> dynamicContent;

    public BulkEmailAudience getAudience() {
        return audience;
    }

    public void setAudience(BulkEmailAudience audience) {
        this.audience = audience;
    }

    public List<String> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<String> recipients) {
        this.recipients = recipients;
    }

    public Map<String, Object> getDynamicContent() {
        return dynamicContent;
    }

    public void setDynamicContent(Map<String, Object> dynamicContent) {
        this.dynamicContent = dynamicContent;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getCc() {
        return cc;
    }

    public void setCc(String cc) {
        this.cc = cc;
    }

    public String getBy() {
        return by;
    }

    public void setBy(String by) {
        this.by = by;
    }

}
