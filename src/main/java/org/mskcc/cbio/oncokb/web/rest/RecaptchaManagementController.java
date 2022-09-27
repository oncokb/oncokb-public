package org.mskcc.cbio.oncokb.web.rest;

import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import javax.xml.bind.ValidationException;

@Component
public class RecaptchaManagementController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecaptchaManagementController.class);

    public RecaptchaManagementController() {
        super();
    }

    public @ResponseBody ResponseObject validateCaptcha(HttpServletRequest request, String storedRecaptchaToken)
            throws ValidationException {

        String url = "https://www.google.com/recaptcha/api/siteverify";
        String secret = "6LcxRsMZAAAAAIQtqDL3D4PgDdP2b-GG8TO7R8Yq";

        // String recaptchaToken =  request.getParameter("g-recaptcha-response");
        // String token = request.getHeader("g-recaptcha-response");

        ResponseObject responseObject = new ResponseObject();
        try {

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url).queryParam("secret", secret)
                    .queryParam("response", storedRecaptchaToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<RecaptchaResponse> response = restTemplate.exchange(builder.build().encode().toUri(),
                    HttpMethod.GET, entity, RecaptchaResponse.class);

            RecaptchaResponse rs = response.getBody();

            if (response.getStatusCode().value() == 200 && rs.isSuccess() && (rs.getScore() >= 0.1)) {
                responseObject.setToken("Valid");
                LOGGER.info("RECAPTCHA TOKEN VERIFIED SUCCESSFULLY");
            } else {
                LOGGER.error("CAPTCHA_VALIDATION_FAILED");
                throw new ValidationException("CAPTCHA_VALIDATION_FAILED");
            }

            return responseObject;

        } catch (Exception e) {
            e.printStackTrace();
            LOGGER.error("CAPTCHA_VALIDATION_FAILED", e);
            throw new ValidationException("CAPTCHA_VALIDATION_FAILED", e);
        }

    }
}