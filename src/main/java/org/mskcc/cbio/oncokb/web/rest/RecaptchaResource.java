package org.mskcc.cbio.oncokb.web.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * 
 */
@RestController
@RequestMapping("/api")
public class RecaptchaResource {

    /**
     * {@code GET  /recaptcha/validate} : validate the tokens
     * @throws Exception
     * @return true if token is validated
     */
    @GetMapping("/recaptcha/validate")
    public boolean validateRecaptcha(HttpServletRequest request) throws Exception {
        try {
            ResponseEntity<String> rs = CreateAssessment.createAssessment(request);
            return rs.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = e.getMessage();
            throw new Exception(errorMessage);
        }
    }
}
