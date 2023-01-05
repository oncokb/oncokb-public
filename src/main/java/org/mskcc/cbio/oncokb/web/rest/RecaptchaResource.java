package org.mskcc.cbio.oncokb.web.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * REST controller for managing {@link org.mskcc.cbio.oncokb.domain.Token}.
 * 
 */
@RestController
@RequestMapping("/api")
public class RecaptchaResource {

    /**
     * {@code GET  /tokens} : get all the tokens.
     * @throws Exception
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
