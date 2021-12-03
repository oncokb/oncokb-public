package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.stereotype.Service;



/**
 * Service for processing email related logic.
 */
@Service
public class EmailService {

    private final ApplicationProperties applicationProperties;

    public EmailService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

}
