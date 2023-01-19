package org.mskcc.cbio.oncokb.web.rest;


import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.Constants;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.xml.bind.ValidationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;


@SpringBootTest(classes = OncokbPublicApp.class)
@AutoConfigureMockMvc
public class RecaptchaAssessmentIT {

    @Test
    public void testCreateAssessmentWithToken() throws Exception  {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("g-recaptcha-response", Constants.TESTING_TOKEN);
        
        ResponseEntity<String> rs = CreateAssessment.createAssessment(request);
        
        assertThat(rs.getStatusCode() == HttpStatus.OK);
    }

    @Test
    public void testCreateAssessmentWithoutToken() throws Exception  {
        MockHttpServletRequest request = new MockHttpServletRequest();

        Exception e = assertThrows(ValidationException.class, () -> {
            CreateAssessment.createAssessment(request);
        });
        assertThat(e.getMessage().contains("token"));
    }
    
}
