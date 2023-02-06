package org.mskcc.cbio.oncokb.web.rest;

import com.google.api.gax.core.NoCredentialsProvider;
import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceClient;
import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceSettings;
import com.google.recaptchaenterprise.v1.Assessment;
import com.google.recaptchaenterprise.v1.CreateAssessmentRequest;
import com.google.recaptchaenterprise.v1.Event;
import com.google.recaptchaenterprise.v1.ProjectName;
import java.io.IOException;

import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.RecaptchaProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.ValidationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class CreateAssessment {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(CreateAssessment.class);

  private static String RECAPTCHA_VALIDATION_ERROR = "Validation failed";
  private static String RECAPTCHA_TOKEN_ERROR = "Unable to retrieve recaptcha token. Please try again.";

  static RecaptchaProperties recaptchaProperties;

  public CreateAssessment(ApplicationProperties applicationProperties){
      this.recaptchaProperties = applicationProperties.getRecaptcha();
  }

  /**
   * Create an assessment to analyze the risk of an UI action. Assessment approach
   * is the same for
   * both 'score' and 'checkbox' type recaptcha site keys.
   * @return
   * @throws ValidationException
   */
  public static ResponseEntity<String> createAssessment(HttpServletRequest request, boolean testingMode)
      throws IOException, ValidationException {

    String recaptchaToken = request.getHeader("g-recaptcha-response");
    if (recaptchaToken == null) {
      throw new ValidationException(RECAPTCHA_TOKEN_ERROR);
    }

    RecaptchaEnterpriseServiceSettings settings;
    if (testingMode) {
      settings = RecaptchaEnterpriseServiceSettings.newBuilder()
            .setCredentialsProvider(NoCredentialsProvider.create())
            .build();
    } else {
      settings = null;
    }

    if (recaptchaProperties == null && !testingMode) {
      LOGGER.info("Recaptcha enterprise is not initiated.");
    }
    
    try (RecaptchaEnterpriseServiceClient client = RecaptchaEnterpriseServiceClient.create(settings)) {

      // Set the properties of the event to be tracked.
      Event event = Event.newBuilder().setSiteKey(recaptchaProperties.getSiteKey()).setToken(recaptchaToken).build();

      // Build the assessment request.
      CreateAssessmentRequest createAssessmentRequest = CreateAssessmentRequest.newBuilder()
          .setParent(ProjectName.of(recaptchaProperties.getProjectId()).toString())
          .setAssessment(Assessment.newBuilder().setEvent(event).build())
          .build();

      Assessment response = client.createAssessment(createAssessmentRequest);

      client.close();
      LOGGER.info("my site key " + recaptchaProperties.getSiteKey());

      // Check if the token is valid.
      if (response.getTokenProperties().getValid() && response.getRiskAnalysis().getScore() >= recaptchaProperties.getThreshold()) {
        LOGGER.info("RECAPTCHA TOKEN VERIFIED SUCCESSFULLY. SCORE: " + response.getRiskAnalysis().getScore());
        return new ResponseEntity<>("Recaptcha successfully validated", HttpStatus.OK);
      } else {
        LOGGER.info(
            "The CreateAssessment call failed because the token was: "
                + response.getTokenProperties().getInvalidReason().name());
        throw new ValidationException(RECAPTCHA_VALIDATION_ERROR);
      }

    } catch (Exception e) {
      e.printStackTrace();
      throw new ValidationException(RECAPTCHA_VALIDATION_ERROR);
    }
  }
}
