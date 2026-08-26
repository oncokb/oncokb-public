package org.mskcc.cbio.oncokb.service;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridMailRequest;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridMailSendPayload;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridRecipient;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridGroupSuppressionsRequest;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSendResult;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSuppression;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSuppressionPayload;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSuppressionsEnvelope;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class SendGridService {

    private static final String SENDGRID_MAIL_SEND_PATH = "/v3/mail/send";
    private static final String SENDGRID_GROUP_SUPPRESSION_PATH = "/v3/asm/groups/{groupId}/suppressions/{email}";
    private static final String SENDGRID_GROUP_SUPPRESSIONS_PATH = "/v3/asm/groups/{groupId}/suppressions";
    private static final String SENDGRID_SUPPRESSIONS_PATH = "/v3/asm/suppressions/{email}";

    private final ApplicationProperties applicationProperties;

    public SendGridService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public boolean isConfigured() {
        return applicationProperties.getSendgrid() != null
            && applicationProperties.getSendgrid().isEnabled()
            && StringUtils.isNotBlank(applicationProperties.getSendgrid().getApiKey())
            && StringUtils.isNotBlank(applicationProperties.getSendgrid().getBaseUrl());
    }

    public SendGridSendResult sendTemplatedMail(SendGridMailRequest request) {
        SendGridMailSendPayload payload = toSendPayload(request);
        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(
                resolveUrl(SENDGRID_MAIL_SEND_PATH),
                new HttpEntity<>(payload, buildSendGridHeaders()),
                String.class
            );
            SendGridSendResult result = new SendGridSendResult();
            result.setStatusCode(response.getStatusCodeValue());
            result.setMessageId(response.getHeaders().getFirst("X-Message-Id"));
            return result;
        } catch (HttpStatusCodeException e) {
            throw new SendGridIntegrationException(
                "SendGrid mail send request failed with status " + e.getRawStatusCode() + ".",
                e.getRawStatusCode(),
                e
            );
        } catch (RestClientException e) {
            throw new SendGridIntegrationException("SendGrid mail send request failed.", null, e);
        }
    }

    public List<SendGridSuppression> getSuppressionsForEmail(String email) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<SendGridSuppressionsEnvelope> response = restTemplate.exchange(
                resolveUrl(SENDGRID_SUPPRESSIONS_PATH),
                HttpMethod.GET,
                new HttpEntity<>(buildSendGridHeaders()),
                SendGridSuppressionsEnvelope.class,
                email
            );

            SendGridSuppressionsEnvelope envelope = response.getBody();
            if (envelope == null || envelope.getSuppressions() == null) {
                return Collections.emptyList();
            }

            List<SendGridSuppression> suppressions = new ArrayList<>();
            for (SendGridSuppressionPayload rawSuppression : envelope.getSuppressions()) {
                if (rawSuppression == null || rawSuppression.getId() == null) {
                    continue;
                }
                suppressions.add(new SendGridSuppression(
                    rawSuppression.getId(),
                    rawSuppression.getName(),
                    rawSuppression.getSuppressed() == null || rawSuppression.getSuppressed()
                ));
            }
            return suppressions;
        } catch (HttpStatusCodeException e) {
            throw new SendGridIntegrationException(
                "SendGrid suppressions request failed with status " + e.getRawStatusCode() + ".",
                e.getRawStatusCode(),
                e
            );
        } catch (RestClientException e) {
            throw new SendGridIntegrationException("SendGrid suppressions request failed.", null, e);
        }
    }

    public void addGroupSuppression(Long groupId, String email) {
        SendGridGroupSuppressionsRequest body = new SendGridGroupSuppressionsRequest();
        body.setRecipientEmails(Collections.singletonList(email));

        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.postForEntity(
                resolveUrl(SENDGRID_GROUP_SUPPRESSIONS_PATH),
                new HttpEntity<>(body, buildSendGridHeaders()),
                String.class,
                groupId
            );
        } catch (HttpStatusCodeException e) {
            throw new SendGridIntegrationException(
                "SendGrid add suppression request failed with status " + e.getRawStatusCode() + ".",
                e.getRawStatusCode(),
                e
            );
        } catch (RestClientException e) {
            throw new SendGridIntegrationException("SendGrid add suppression request failed.", null, e);
        }
    }

    public void removeGroupSuppression(Long groupId, String email) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.exchange(
                resolveUrl(SENDGRID_GROUP_SUPPRESSION_PATH),
                HttpMethod.DELETE,
                new HttpEntity<>(buildSendGridHeaders()),
                String.class,
                groupId,
                email
            );
        } catch (HttpStatusCodeException e) {
            throw new SendGridIntegrationException(
                "SendGrid remove suppression request failed with status " + e.getRawStatusCode() + ".",
                e.getRawStatusCode(),
                e
            );
        } catch (RestClientException e) {
            throw new SendGridIntegrationException("SendGrid remove suppression request failed.", null, e);
        }
    }

    private SendGridMailSendPayload toSendPayload(SendGridMailRequest request) {
        SendGridMailSendPayload payload = new SendGridMailSendPayload();
        payload.setFrom(new SendGridMailSendPayload.EmailAddress(request.getFromEmail()));
        payload.setTemplateId(request.getTemplateId());

        List<SendGridMailSendPayload.Personalization> personalizations = new ArrayList<>();
        for (SendGridRecipient recipient : request.getRecipients()) {
            SendGridMailSendPayload.Personalization personalization = new SendGridMailSendPayload.Personalization();
            personalization.setTo(Collections.singletonList(new SendGridMailSendPayload.EmailAddress(recipient.getToEmail())));
            if (StringUtils.isNotBlank(recipient.getCcEmail())) {
                personalization.setCc(Collections.singletonList(new SendGridMailSendPayload.EmailAddress(recipient.getCcEmail())));
            }
            personalization.setDynamicTemplateData(recipient.getDynamicTemplateData());
            personalizations.add(personalization);
        }
        payload.setPersonalizations(personalizations);

        if (request.getAsmGroupId() != null) {
            SendGridMailSendPayload.Asm asm = new SendGridMailSendPayload.Asm();
            asm.setGroupId(request.getAsmGroupId());
            if (request.getGroupsToDisplay() != null && !request.getGroupsToDisplay().isEmpty()) {
                asm.setGroupsToDisplay(request.getGroupsToDisplay());
            }
            payload.setAsm(asm);
        }

        return payload;
    }

    private HttpHeaders buildSendGridHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(applicationProperties.getSendgrid().getApiKey());
        return headers;
    }

    private String resolveUrl(String path) {
        return applicationProperties.getSendgrid().getBaseUrl() + path;
    }
}
