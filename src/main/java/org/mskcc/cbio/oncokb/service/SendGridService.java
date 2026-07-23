package org.mskcc.cbio.oncokb.service;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridMailRequest;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridRecipient;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSendResult;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSuppression;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
        Map<String, Object> payload = toSendPayload(request);
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
            ResponseEntity<Object> response = restTemplate.exchange(
                resolveUrl(SENDGRID_SUPPRESSIONS_PATH),
                HttpMethod.GET,
                new HttpEntity<>(buildSendGridHeaders()),
                Object.class,
                email
            );
            return parseSuppressions(response.getBody());
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
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("recipient_emails", Collections.singletonList(email));

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

    private Map<String, Object> toSendPayload(SendGridMailRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", Collections.singletonMap("email", request.getFromEmail()));
        payload.put("template_id", request.getTemplateId());

        List<Map<String, Object>> personalizations = new ArrayList<>();
        for (SendGridRecipient recipient : request.getRecipients()) {
            Map<String, Object> personalization = new LinkedHashMap<>();
            personalization.put("to", Collections.singletonList(Collections.singletonMap("email", recipient.getToEmail())));
            if (StringUtils.isNotBlank(recipient.getCcEmail())) {
                personalization.put("cc", Collections.singletonList(Collections.singletonMap("email", recipient.getCcEmail())));
            }
            personalization.put("dynamic_template_data", recipient.getDynamicTemplateData());
            personalizations.add(personalization);
        }
        payload.put("personalizations", personalizations);

        if (request.getAsmGroupId() != null) {
            Map<String, Object> asm = new LinkedHashMap<>();
            asm.put("group_id", request.getAsmGroupId());
            if (request.getGroupsToDisplay() != null && !request.getGroupsToDisplay().isEmpty()) {
                asm.put("groups_to_display", request.getGroupsToDisplay());
            }
            payload.put("asm", asm);
        }

        return payload;
    }

    private List<SendGridSuppression> parseSuppressions(Object responseBody) {
        List<?> groups = Collections.emptyList();
        if (responseBody instanceof Map) {
            Object suppressions = ((Map<?, ?>) responseBody).get("suppressions");
            if (suppressions instanceof List) {
                groups = (List<?>) suppressions;
            }
        } else if (responseBody instanceof List) {
            groups = (List<?>) responseBody;
        }

        List<SendGridSuppression> suppressions = new ArrayList<>();
        for (Object groupObj : groups) {
            if (!(groupObj instanceof Map)) {
                continue;
            }
            Map<?, ?> groupMap = (Map<?, ?>) groupObj;
            Long groupId = toLong(groupMap.get("id"));
            if (groupId == null) {
                continue;
            }

            String groupName = toStringOrNull(groupMap.get("name"));
            boolean suppressed = toBoolean(groupMap.get("suppressed"), true);
            suppressions.add(new SendGridSuppression(groupId, groupName, suppressed));
        }
        return suppressions;
    }

    private String toStringOrNull(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean toBoolean(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return Boolean.parseBoolean(String.valueOf(value));
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
