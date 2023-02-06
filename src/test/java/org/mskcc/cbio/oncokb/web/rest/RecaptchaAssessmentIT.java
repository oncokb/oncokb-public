package org.mskcc.cbio.oncokb.web.rest;


import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.RecaptchaProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.xml.bind.ValidationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;


@SpringBootTest(classes = OncokbPublicApp.class)
@AutoConfigureMockMvc
public class RecaptchaAssessmentIT {

    ApplicationProperties appProps;
    RecaptchaProperties recaptchaProp;
    private static String RECAPTCHA_TESTING_TOKEN = "faketoken";
    private static String RECAPTCHA_VALIDATION_ERROR = "Validation failed";
    private static String RECAPTCHA_TOKEN_ERROR = "Unable to retrieve recaptcha token. Please try again.";

    @BeforeEach
    public void setup() {
        appProps = new ApplicationProperties();
        recaptchaProp = new RecaptchaProperties();
    }

    @Test
    public void testCreateAssessmentWithTokenGoodScore() throws Exception  {
        recaptchaProp.setProjectId("symbolic-nation-320615");
        recaptchaProp.setSiteKey("6LfAOe4jAAAAANjzxWQ8mKilcvk1QvLLohd7EV7F"); 
        recaptchaProp.setThreshold((float) 0.5);
        appProps.setRecaptcha(recaptchaProp);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("g-recaptcha-response", RECAPTCHA_TESTING_TOKEN);
        ResponseEntity<String> rs = createAssess.createAssessment(request,true);
        
        assertThat(rs.getStatusCode() == HttpStatus.OK);
    }

    @Test
    public void testCreateAssessmentWithoutToken() throws Exception  {
        recaptchaProp.setProjectId("symbolic-nation-320615");
        recaptchaProp.setSiteKey("6LfAOe4jAAAAANjzxWQ8mKilcvk1QvLLohd7EV7F");
        recaptchaProp.setThreshold((float) 0.5);
        appProps.setRecaptcha(recaptchaProp);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();
        
        Exception e = assertThrows(ValidationException.class, () -> {
            createAssess.createAssessment(request,true);
        });
        assertThat(e.getMessage().equals(RECAPTCHA_TOKEN_ERROR));
    }

    @Test
    public void testCreateAssessmentWithTokenBadScore() throws Exception  {
        recaptchaProp.setProjectId("symbolic-nation-320615");
        recaptchaProp.setSiteKey("6LceqfAjAAAAAId_GeUVV2s4PoccWOXWNm0TM8Av");
        recaptchaProp.setThreshold((float) 0.5);
        appProps.setRecaptcha(recaptchaProp);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("g-recaptcha-response", RECAPTCHA_TESTING_TOKEN);
        
        Exception e = assertThrows(ValidationException.class, () -> {
            createAssess.createAssessment(request,true);
        });
        assertThat(e.getMessage().equals(RECAPTCHA_VALIDATION_ERROR));
    }
    
}
