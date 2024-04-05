package org.mskcc.cbio.oncokb.service;

import com.slack.api.Slack;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
import com.slack.api.model.block.composition.TextObject;
import com.slack.api.webhook.Payload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SlackProperties;
import org.mskcc.cbio.oncokb.domain.Company;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseStatus;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = OncokbPublicApp.class)
class SlackServiceIT {

    // Testing Slack url for applicationProperties
    private static final String USER_REGISTRATION_WEBHOOK =  "https://hooks.slack.com/example";

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private MailService mailService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMailsService userMailsService;

    @Autowired
    private UserMapper userMapper;

    @Spy
    private Slack slack;

    @Captor
    private ArgumentCaptor<String> urlCaptor;

    @Captor
    private ArgumentCaptor<Payload> payloadCaptor;

    private SlackService slackService;

    @BeforeEach
    public void setup() throws IOException {
        // Set up mock Slack instance to catch payload
        MockitoAnnotations.initMocks(this);
        doReturn(null).when(slack).send(any(String.class), any(Payload.class));

        // Specify webhook address for testing
        applicationProperties.setSlack(new SlackProperties());
        applicationProperties.getSlack().setUserRegistrationWebhook(USER_REGISTRATION_WEBHOOK);

        slackService = new SlackService(applicationProperties, mailService, emailService, userService, userMailsService, userMapper, slack);
    }

    @Test
    void testSendUserRegistrationToChannel() throws IOException {
        // Create mock user
        UserDTO user = new UserDTO();
        user.setId(0L);
        user.setEmail("john.doe@example.com");
        user.setFirstName("john");
        user.setLastName("doe");
        user.setJobTitle("job title");
        user.setCompanyName("company name");
        user.setCity("city");
        user.setCountry("country");
        user.setLicenseType(LicenseType.COMMERCIAL);
        Company company = new Company();
        company.setName("company name");
        company.setLicenseType(LicenseType.COMMERCIAL);
        company.setLicenseStatus(LicenseStatus.UNKNOWN);

        // Mock send Slack blocks
        slackService.sendUserRegistrationToChannel(user, false, company);
        verify(slack).send(urlCaptor.capture(), payloadCaptor.capture());
        String url = urlCaptor.getValue();
        Payload payload = payloadCaptor.getValue();

        // Ensure url is correct
        assertThat(url).isEqualTo(USER_REGISTRATION_WEBHOOK);

        // Ensure all crucial information is in payload
        Set<String> expectedValues = new HashSet<>();
        expectedValues.add(LicenseType.COMMERCIAL.getName());
        expectedValues.add("Not Activated");
        expectedValues.add("REGULAR");
        expectedValues.add("john.doe@example.com");
        expectedValues.add("john doe");
        expectedValues.add("job title");
        expectedValues.add("company name");
        expectedValues.add("city");
        expectedValues.add("country");
        for (LayoutBlock block : payload.getBlocks()) {
            if (block instanceof SectionBlock) {
                SectionBlock sectionBlock = (SectionBlock) block;
                if (sectionBlock.getText() != null) {
                    expectedValues.removeIf(sectionBlock.getText().getText()::contains);
                }
                if (sectionBlock.getFields() != null) {
                    for (TextObject textObject : sectionBlock.getFields()) {
                        expectedValues.removeIf(textObject.getText()::contains);
                    }
                }
            }
        }
        assertThat(expectedValues).isEmpty();
    }
}
