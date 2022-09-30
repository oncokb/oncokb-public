package org.mskcc.cbio.oncokb.web.rest;

import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import javax.xml.bind.ValidationException;

@Component
public class RecaptchaManagementController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecaptchaManagementController.class);

    public RecaptchaManagementController() {
        super();
    }

    public @ResponseBody ResponseEntity<String> validateCaptcha(HttpServletRequest request, @RequestParam String storedRecaptchaToken)
            throws ValidationException {

        String url = "https://www.google.com/recaptcha/api/siteverify";

        ResponseObject responseObject = new ResponseObject();
        try {

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url).queryParam("response", storedRecaptchaToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<RecaptchaResponse> response = restTemplate.exchange(builder.build().encode().toUri(),
                    HttpMethod.GET, entity, RecaptchaResponse.class);

            RecaptchaResponse rs = response.getBody();

            if (response.getStatusCode().value() == 200 && rs.getScore() >= 0.1) {
                responseObject.setToken("Valid");
                LOGGER.info("RECAPTCHA TOKEN VERIFIED SUCCESSFULLY");
                return new ResponseEntity<>("Recaptcha successfully validated",HttpStatus.OK); 
            } else {
                LOGGER.error("HTTP STATUS 400: CAPTCHA VALIDATION FAILED");
                // throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"HTTP STATUS 400: CAPTCHA_VALIDATION_FAILED");
                throw new ValidationException("HTTP STATUS 400: CAPTCHA VALIDATION FAILED", "400");
                // return new ResponseEntity<>("Recaptcha could not be validated",HttpStatus.BAD_REQUEST);
            }
        

        } catch (Exception e) {
            e.printStackTrace();
            LOGGER.error("CAPTCHA_VALIDATION_FAILED", e);
            throw new ValidationException("HTTP STATUS 400: CAPTCHA VALIDATION FAILED", "400", e);
        }

    }
}