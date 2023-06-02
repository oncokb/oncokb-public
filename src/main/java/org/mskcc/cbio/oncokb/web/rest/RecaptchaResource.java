package org.mskcc.cbio.oncokb.web.rest;

import org.springframework.http.ResponseEntity;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceClient;

import javax.servlet.http.HttpServletRequest;

import javax.naming.ConfigurationException;
import javax.xml.bind.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 */
@RestController
@RequestMapping("/api")
public class RecaptchaResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);
    private CreateAssessment createAssess;

    public RecaptchaResource(ApplicationProperties applicationProperties) {

        this.createAssess = new CreateAssessment(applicationProperties);
    }

    /**
     * {@code GET  /recaptcha/validate} : validate the tokens
     * @throws Exception
     * @return true if token is validated
     */
    @GetMapping("/recaptcha/validate")
    public boolean validateRecaptcha(HttpServletRequest request) throws Exception {
        try {
            RecaptchaEnterpriseServiceClient client = createAssess.createClient();
            String recaptchaToken = createAssess.getRecaptchaToken(request);
            ResponseEntity<String> rs = createAssess.createAssessment(client,recaptchaToken);
            return rs.getStatusCode() == HttpStatus.OK;
        } catch (ValidationException e) {
            String errorMessage = e.getMessage();
            if (errorMessage.contains("Unable to retrieve recaptcha token.")) {
                log.info(errorMessage);
            } 
            return false;
        } catch (ConfigurationException e) {
            log.warn(e.getMessage());
            return true;
        }
    }
}
