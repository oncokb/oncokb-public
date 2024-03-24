package org.mskcc.cbio.oncokb.service;

import java.io.File;
import java.nio.file.Paths;
import java.util.Optional;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SamlAwsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3Service {

    private final Logger log = LoggerFactory.getLogger(S3Service.class);

    private final SamlService samlService;
    
    private final ApplicationProperties applicationProperties;

    private S3Client s3Client;

    public S3Service(SamlService samlService, ApplicationProperties applicationProperties) {
        this.samlService = samlService;
        this.applicationProperties = applicationProperties;
        SamlAwsProperties samlAwsProperties = applicationProperties.getSamlAws();
        if (samlAwsProperties != null) {
            String region = samlAwsProperties.getRegion();
            s3Client = S3Client.builder().credentialsProvider(samlService.getCredentialsProvider()).region(Region.of(region)).build();
        } else {
            log.error("Saml AWS properties not configured");
        }
    }

    /**
     * Save an object to aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path where the object will be saved
     * @param file the object
     */
    public void saveObject(String bucket, String objectPath, File file){
        PutObjectRequest putObjectRequest = PutObjectRequest
            .builder()
            .bucket(bucket)
            .key(objectPath)
            .build();
        s3Client.putObject(putObjectRequest, Paths.get(file.getPath()));
    }

    /**
     * Get an object from aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path of the object
     * @return a S3 object
     */
    public Optional<ResponseInputStream<GetObjectResponse>> getObject(String bucket, String objectPath){
        try {
            ResponseInputStream<GetObjectResponse> s3object = s3Client.getObject(GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectPath)
                .build(), ResponseTransformer.toInputStream());
            return Optional.of(s3object);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return Optional.empty();
        }
    }
}
