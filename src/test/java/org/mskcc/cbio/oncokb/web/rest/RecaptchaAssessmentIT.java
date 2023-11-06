package org.mskcc.cbio.oncokb.web.rest;

import org.junit.jupiter.api.*;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.FrontendProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceClient;
import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceSettings;

import javax.naming.ConfigurationException;
import javax.xml.bind.ValidationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootTest(classes = OncokbPublicApp.class)
@AutoConfigureMockMvc
public class RecaptchaAssessmentIT {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecaptchaAssessmentIT.class);

    ApplicationProperties appProps;
    FrontendProperties frontendProps;
    RecaptchaEnterpriseServiceClient client;
    private static String RECAPTCHA_TESTING_TOKEN = "faketoken";

    @BeforeEach
    public void setUp() throws IOException {
        appProps = new ApplicationProperties();
        frontendProps = new FrontendProperties();
    }

    @Test
    public void testGetRecaptchaTokenWithToken() throws Exception {
        appProps.setFrontend(frontendProps);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("g-recaptcha-response", RECAPTCHA_TESTING_TOKEN);

        String recaptchaToken = createAssess.getRecaptchaToken(request);

        assertThat(recaptchaToken != null);
    }

    @Test
    public void testGetRecaptchaTokenWithoutToken() throws Exception {
        appProps.setFrontend(frontendProps);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();

        Exception e = assertThrows(ValidationException.class, () -> {
            String recaptchaToken = createAssess.getRecaptchaToken(request);
        });
        assertThat(e.getMessage().equals(CreateAssessment.RECAPTCHA_TOKEN_ERROR));
    }

    @Test
    public void testGetRecaptchaWithoutConfiguration() throws Exception {
        appProps.setFrontend(frontendProps);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        Exception e = assertThrows(ConfigurationException.class, () -> {
            RecaptchaEnterpriseServiceClient client = createAssess.createClient();
        });
        assertThat(e.getMessage().equals(CreateAssessment.RECAPTCHA_CONFIGURATION_ERROR));
    }

}
