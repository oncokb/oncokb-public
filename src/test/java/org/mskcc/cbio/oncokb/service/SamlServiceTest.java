package org.mskcc.cbio.oncokb.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SamlAwsProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

class SamlServiceTest {

    private static final String IDP_URL = "https://ssofed.mskcc.org/idp/startSSO.ping?PartnerSpId=urn:amazon:webservices";

    @Test
    void getSamlResponseShouldSetConfiguredUserAgentHeader() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SamlService samlService = new SamlService(buildApplicationProperties("test-allowed-agent/1.0"), restTemplate);

        server
            .expect(requestTo(IDP_URL))
            .andExpect(method(HttpMethod.POST))
            .andExpect(header(HttpHeaders.USER_AGENT, "test-allowed-agent/1.0"))
            .andExpect(content().string("pf.username=service-user&pf.pass=service-pass"))
            .andRespond(withSuccess("<html><input name=\"SAMLResponse\" value=\"encoded-saml\"/></html>", MediaType.TEXT_HTML));

        String samlResponse = ReflectionTestUtils.invokeMethod(samlService, "getSamlResponse");

        assertEquals("encoded-saml", samlResponse);
        server.verify();
    }

    @Test
    void getSamlResponseShouldNotSetUserAgentHeaderWhenBlank() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SamlService samlService = new SamlService(buildApplicationProperties("   "), restTemplate);

        server
            .expect(requestTo(IDP_URL))
            .andExpect(method(HttpMethod.POST))
            .andExpect(request -> {
                MockClientHttpRequest mockRequest = (MockClientHttpRequest) request;
                List<String> userAgentHeaders = mockRequest.getHeaders().get(HttpHeaders.USER_AGENT);
                if (userAgentHeaders != null && !userAgentHeaders.isEmpty()) {
                    throw new AssertionError("Expected no User-Agent header, but found: " + userAgentHeaders);
                }
            })
            .andRespond(withSuccess("<html><input name=\"SAMLResponse\" value=\"encoded-saml\"/></html>", MediaType.TEXT_HTML));

        String samlResponse = ReflectionTestUtils.invokeMethod(samlService, "getSamlResponse");

        assertEquals("encoded-saml", samlResponse);
        server.verify();
    }

    @Test
    void getSamlResponseShouldThrowWhenSamlResponseInputIsMissing() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SamlService samlService = new SamlService(buildApplicationProperties("test-allowed-agent/1.0"), restTemplate);

        server.expect(requestTo(IDP_URL)).andRespond(withSuccess("<html><body>No assertion</body></html>", MediaType.TEXT_HTML));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            ReflectionTestUtils.invokeMethod(samlService, "getSamlResponse")
        );

        assertEquals("Could not find SAMLResponse value in SAML assertion response", exception.getMessage());
        server.verify();
    }

    private ApplicationProperties buildApplicationProperties(String httpUserAgent) {
        SamlAwsProperties samlAwsProperties = new SamlAwsProperties();
        samlAwsProperties.setServiceAccountUsername("service-user");
        samlAwsProperties.setServiceAccountPassword("service-pass");
        samlAwsProperties.setHttpUserAgent(httpUserAgent);

        ApplicationProperties applicationProperties = new ApplicationProperties();
        applicationProperties.setSamlAws(samlAwsProperties);

        return applicationProperties;
    }
}
