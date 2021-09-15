package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;


/**
 * Service for processing email related logic.
 */
@Service
public class EmailService {

    private final ApplicationProperties applicationProperties;

    public EmailService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public Set<String> getAccountApprovalWhitelistEmailsDomains() {
        return Arrays.stream(this.applicationProperties.getAccountApprovalWhitelist().split(",")).map(email -> email.trim()).collect(Collectors.toSet());
    }
}
