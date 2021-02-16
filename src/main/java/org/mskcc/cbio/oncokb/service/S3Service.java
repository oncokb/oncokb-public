package org.mskcc.cbio.oncokb.service;

import java.io.File;
import java.util.Optional;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3Object;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.stereotype.Service;

@Service
public class S3Service {

    private final ApplicationProperties applicationProperties;

    private AWSCredentials credentials;
    private AmazonS3 s3client;

    public S3Service(ApplicationProperties applicationProperties){
        this.applicationProperties = applicationProperties;

        String s3AccessKey = applicationProperties.getAws().getS3AccessKey();
        String s3SecretKey = applicationProperties.getAws().getS3SecretKey();
        String s3Region = applicationProperties.getAws().getS3Region();
        credentials = new BasicAWSCredentials(s3AccessKey, s3SecretKey);
        s3client = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials)).withRegion(s3Region).build();     
    }

    /**
     * Save an object to aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path where the object will be saved
     * @param file the object
     */
    public void saveObject(String bucket, String objectPath, File file){
        s3client.putObject(bucket, objectPath, file);
    }

    /**
     * Get an object from aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path of the object
     * @return a S3 object
     */
    public Optional<S3Object> getObject(String bucket, String objectPath){
        try {
            S3Object s3object = s3client.getObject(bucket, objectPath); 
            return Optional.of(s3object);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
