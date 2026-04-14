package org.mskcc.cbio.oncokb.service;

import java.io.File;
import java.nio.file.Paths;
import java.util.Optional;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SamlAwsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class S3Service {

    private final Logger log = LoggerFactory.getLogger(S3Service.class);

    private final SamlService samlService;
    
    private final ApplicationProperties applicationProperties;

    private S3Client s3Client;

    public S3Service(SamlService samlService, ApplicationProperties applicationProperties) {
        this.samlService = samlService;
        this.applicationProperties = applicationProperties;
    }

    private S3Client getS3Client() {
        if (this.s3Client != null) {
            return this.s3Client;
        }

        SamlAwsProperties samlAwsProperties = applicationProperties.getSamlAws();
        if (samlAwsProperties == null) {
            log.error("SAML AWS properties are not configured");
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "AWS S3 configuration is missing."
            );
        }

        try {
            this.s3Client =
                S3Client
                    .builder()
                    .credentialsProvider(samlService.getCredentialsProvider())
                    .region(Region.of(samlAwsProperties.getRegion()))
                    .build();
            return this.s3Client;
        } catch (ResponseStatusException ex) {
            log.error("Failed to create the S3 client", ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to create the S3 client", ex);
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "The S3 service is temporarily unavailable."
            );
        }
    }

    /**
     * Save an object to aws s3
     * @param objectPath the path where the object will be saved
     * @param file the object
     */
    public void saveObject(String objectPath, File file){
        PutObjectRequest putObjectRequest = PutObjectRequest
            .builder()
            .bucket(applicationProperties.getS3Bucket())
            .key(objectPath)
            .build();
        getS3Client().putObject(putObjectRequest, Paths.get(file.getPath()));
    }

    /**
     * Get an object from aws s3
     * @param objectPath the path of the object
     * @return a S3 object
     */
    public Optional<ResponseInputStream<GetObjectResponse>> getObject(String objectPath){
        try {
            ResponseInputStream<GetObjectResponse> s3object = getS3Client().getObject(GetObjectRequest.builder()
                .bucket(applicationProperties.getS3Bucket())
                .key(objectPath)
                .build(), ResponseTransformer.toInputStream());
            return Optional.of(s3object);
        } catch (NoSuchKeyException ex) {
            return Optional.empty();
        } catch (S3Exception ex) {
            if (ex.statusCode() == 404) {
                return Optional.empty();
            }
            log.error("Failed to retrieve S3 object {} from bucket {}", objectPath, applicationProperties.getS3Bucket(), ex);
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "The S3 service is temporarily unavailable."
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception e) {
            log.error("Failed to retrieve S3 object {} from bucket {}", objectPath, applicationProperties.getS3Bucket(), e);
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "The S3 service is temporarily unavailable."
            );
        }
    }
}
