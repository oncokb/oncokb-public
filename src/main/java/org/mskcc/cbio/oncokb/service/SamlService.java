package org.mskcc.cbio.oncokb.service;

import java.util.function.Supplier;
import javax.annotation.PostConstruct;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleWithSamlCredentialsProvider;
import software.amazon.awssdk.services.sts.model.AssumeRoleWithSamlRequest;

@Service
public class SamlService {
    private StsAssumeRoleWithSamlCredentialsProvider credentialsProvider;

    private final String MSK_IDP_URL ="https://ssofed.mskcc.org/idp/startSSO.ping?PartnerSpId=urn:amazon:webservices";
    private final String MSK_USERNAME_FIELD = "pf.username";
    private final String MSK_PASSWORD_FIELD = "pf.pass";

    private final ApplicationProperties applicationProperties;

    public SamlService(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @PostConstruct
    private void initSecurityTokenServiceProvider() {
        if (applicationProperties.getSamlAws() != null) {
            AssumeRoleWithSamlRequest samlRequest = AssumeRoleWithSamlRequest
                .builder()
                .principalArn(applicationProperties.getSamlAws().getPrincipalArn())
                .roleArn(applicationProperties.getSamlAws().getRoleArn())
                .durationSeconds(28800)
                .build();

            Supplier<AssumeRoleWithSamlRequest> supplier = () ->
                samlRequest.toBuilder().samlAssertion(getSamlResponse()).build();

            StsAssumeRoleWithSamlCredentialsProvider stsProvider = StsAssumeRoleWithSamlCredentialsProvider
                .builder()
                .stsClient(StsClient.builder().credentialsProvider(AnonymousCredentialsProvider.create()).region(Region.US_EAST_1).build())
                .refreshRequest(supplier)
                .build();
            credentialsProvider = stsProvider;
        }
    }

    public AwsCredentials getAwsCredentials() {
        return this.credentialsProvider.resolveCredentials();
    }

    public StsAssumeRoleWithSamlCredentialsProvider getCredentialsProvider() {
        return this.credentialsProvider;
    }

    private String getSamlResponse() {

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<String, String>();
        map.add(MSK_USERNAME_FIELD, applicationProperties.getSamlAws().getServiceAccountUsername());
        map.add(MSK_PASSWORD_FIELD, applicationProperties.getSamlAws().getServiceAccountPassword());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<MultiValueMap<String, String>>(
            map,
            headers
        );
        ResponseEntity<String> response = restTemplate.postForEntity(
            MSK_IDP_URL,
            request,
            String.class
        );

        Document document = Jsoup.parse(response.getBody());
        Element samlResponseElement = document
            .select("input[name=SAMLResponse]")
            .first();

        if (samlResponseElement != null) {
            return samlResponseElement.attr("value");
        }
        return null;
    }
}
