package org.mskcc.cbio.oncokb.service.dto.sendgrid;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SendGridSuppressionsEnvelope {
    private List<SendGridSuppressionPayload> suppressions;

    public List<SendGridSuppressionPayload> getSuppressions() {
        return suppressions;
    }

    public void setSuppressions(List<SendGridSuppressionPayload> suppressions) {
        this.suppressions = suppressions;
    }
}
