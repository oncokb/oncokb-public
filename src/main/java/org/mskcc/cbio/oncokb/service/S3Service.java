package org.mskcc.cbio.oncokb.service;

import java.io.File;
import java.util.Optional;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3Object;

import org.mskcc.cbio.oncokb.web.rest.vm.AwsCredentials;
import org.springframework.stereotype.Service;

@Service
public class S3Service {

    public S3Service() {
    }

    public static AmazonS3 buildS3Client(AwsCredentials awsCredentials) {
            String s3AccessKey = awsCredentials.getAccessKey();
            String s3SecretKey = awsCredentials.getSecretKey();
            String s3Region = awsCredentials.getRegion();
            AWSCredentials credentials = new BasicAWSCredentials(s3AccessKey, s3SecretKey);
            return AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials)).withRegion(s3Region).build();
    }

    /**
     * Save an object to aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path where the object will be saved
     * @param file the object
     */
    public void saveObject(AmazonS3 client, String bucket, String objectPath, File file){
        client.putObject(bucket, objectPath, file);
    }

    /**
     * Get an object from aws s3
     * @param bucket s3 bucket name
     * @param objectPath the path of the object
     * @return a S3 object
     */
    public Optional<S3Object> getObject(AmazonS3 client, String bucket, String objectPath){
        try {
            S3Object s3object = client.getObject(bucket, objectPath);
            return Optional.of(s3object);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
