package org.mskcc.cbio.oncokb.web.rest;

import org.junit.jupiter.api.*;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.RecaptchaProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import com.google.api.gax.core.NoCredentialsProvider;
import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceClient;
import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceSettings;
// import com.google.api.gax.grpc.testing.MockServiceHelper;
// import com.google.api.gax.grpc.testing.LocalChannelProvider;
// import com.google.api.gax.grpc.testing.MockGrpcService;

import javax.xml.bind.ValidationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootTest(classes = OncokbPublicApp.class)
@AutoConfigureMockMvc
public class RecaptchaAssessmentIT {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecaptchaAssessmentIT.class);

    ApplicationProperties appProps;
    RecaptchaProperties recaptchaProp;
    // static MockRecaptchaEnterpriseService mockRecaptchaEnterpriseService;
    // static MockServiceHelper mockServiceHelper;
    // LocalChannelProvider channelProvider;
    RecaptchaEnterpriseServiceClient client;
    private static String RECAPTCHA_TESTING_TOKEN = "faketoken";

    // @BeforeAll
    // public static void startStaticServer() {
    //     LOGGER.info("start mock service");
    //     // mockRecaptchaEnterpriseService = new MockRecaptchaEnterpriseService();
    //     LOGGER.info("start mock helper");
    //     mockServiceHelper = new MockServiceHelper(
    //             UUID.randomUUID().toString(),
    //             Arrays.<MockGrpcService>asList(mockRecaptchaEnterpriseService));
    //     mockServiceHelper.start();
    // }

    // @AfterAll
    // public static void stopServer() {
    //     mockServiceHelper.stop();
    // }

    @BeforeEach
    public void setUp() throws IOException {
        appProps = new ApplicationProperties();
        recaptchaProp = new RecaptchaProperties();

        // LOGGER.info("reset mock helper");
        // mockServiceHelper.reset();
        // LOGGER.info("create channel provider");
        // channelProvider = mockServiceHelper.createChannelProvider();
        // LOGGER.info("make settings");
        RecaptchaEnterpriseServiceSettings settings = RecaptchaEnterpriseServiceSettings.newBuilder()
                // .setTransportChannelProvider(channelProvider)
                // .setCredentialsProvider(NoCredentialsProvider.create())
                .build();
        LOGGER.info("create client");
        client = RecaptchaEnterpriseServiceClient.create(settings);
    }

    @AfterEach
    public void tearDown() throws Exception {
        client.close();
    }

    @Test
    public void testGetRecaptchaTokenWithToken() throws Exception {
        recaptchaProp.setProjectId("symbolic-nation-320615");
        recaptchaProp.setSiteKey("6LfAOe4jAAAAANjzxWQ8mKilcvk1QvLLohd7EV7F");
        recaptchaProp.setThreshold((float) 0.5);
        appProps.setRecaptcha(recaptchaProp);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("g-recaptcha-response", RECAPTCHA_TESTING_TOKEN);

        String recaptchaToken = createAssess.getRecaptchaToken(request);

        assertThat(recaptchaToken != null);
    }

    @Test
    public void testGetRecaptchaTokenWithoutToken() throws Exception {
        recaptchaProp.setProjectId("symbolic-nation-320615");
        recaptchaProp.setSiteKey("6LfAOe4jAAAAANjzxWQ8mKilcvk1QvLLohd7EV7F");
        recaptchaProp.setThreshold((float) 0.5);
        appProps.setRecaptcha(recaptchaProp);
        CreateAssessment createAssess = new CreateAssessment(appProps);

        MockHttpServletRequest request = new MockHttpServletRequest();

        Exception e = assertThrows(ValidationException.class, () -> {
            String recaptchaToken = createAssess.getRecaptchaToken(request);
            ResponseEntity<String> rs = createAssess.createAssessment(client, recaptchaToken);
        });
        assertThat(e.getMessage().equals(CreateAssessment.RECAPTCHA_TOKEN_ERROR));
    }

    // @Test
    // public void testCreateAssessmentWithTokenGoodScore() throws Exception {
    //     recaptchaProp.setProjectId("symbolic-nation-320615");
    //     recaptchaProp.setSiteKey("6LfAOe4jAAAAANjzxWQ8mKilcvk1QvLLohd7EV7F");
    //     recaptchaProp.setThreshold((float) 0.5);
    //     appProps.setRecaptcha(recaptchaProp);
    //     CreateAssessment createAssess = new CreateAssessment(appProps);

    //     MockHttpServletRequest request = new MockHttpServletRequest();
    //     request.addHeader("g-recaptcha-response", RECAPTCHA_TESTING_TOKEN);

    //     String recaptchaToken = createAssess.getRecaptchaToken(request);
    //     ResponseEntity<String> rs = createAssess.createAssessment(client, recaptchaToken);

    //     assertThat(rs.getStatusCode() == HttpStatus.OK);
    // }

    // @Test
    // public void testCreateAssessmentWithTokenBadScore() throws Exception {
    //     recaptchaProp.setProjectId("symbolic-nation-320615");
    //     recaptchaProp.setSiteKey("6LceqfAjAAAAAId_GeUVV2s4PoccWOXWNm0TM8Av");
    //     recaptchaProp.setThreshold((float) 0.5);
    //     appProps.setRecaptcha(recaptchaProp);
    //     CreateAssessment createAssess = new CreateAssessment(appProps);

    //     MockHttpServletRequest request = new MockHttpServletRequest();
    //     request.addHeader("g-recaptcha-response", RECAPTCHA_TESTING_TOKEN);

    //     Exception e = assertThrows(ValidationException.class, () -> {
    //         String recaptchaToken = createAssess.getRecaptchaToken(request);
    //         ResponseEntity<String> rs = createAssess.createAssessment(client, recaptchaToken);
    //     });
    //     assertThat(e.getMessage().equals(CreateAssessment.RECAPTCHA_VALIDATION_ERROR));
    // }

}
