package org.mskcc.cbio.oncokb.web.rest;

import com.amazonaws.services.appstream.model.Application;
import com.google.cloud.recaptchaenterprise.v1.RecaptchaEnterpriseServiceClient;
import com.google.recaptchaenterprise.v1.Assessment;
import com.google.recaptchaenterprise.v1.CreateAssessmentRequest;
import com.google.recaptchaenterprise.v1.Event;
import com.google.recaptchaenterprise.v1.ProjectName;
import java.io.IOException;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.ValidationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

@Component
public class CreateAssessment {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(CreateAssessment.class);

  static ApplicationProperties applicationProperties;

  public CreateAssessment(ApplicationProperties applicationProperties){
      this.applicationProperties = applicationProperties;
  }

  /**
   * Create an assessment to analyze the risk of an UI action. Assessment approach
   * is the same for
   * both 'score' and 'checkbox' type recaptcha site keys.
   *
   * @param recaptchaToken           : The token obtained from the client on passing the
   *                        recaptchaSiteKey.
   * @param recaptchaAction : Action name corresponding to the token.
   * @return
   * @throws ValidationException
   */
  public static ResponseEntity<String> createAssessment(HttpServletRequest request, @RequestParam String recaptchaToken, String recaptchaAction)
      throws IOException, ValidationException {

    try (RecaptchaEnterpriseServiceClient client = RecaptchaEnterpriseServiceClient.create()) {

      // Set the properties of the event to be tracked.
      Event event = Event.newBuilder().setSiteKey(applicationProperties.getRecaptchaSiteKey()).setToken(recaptchaToken).build();

      // Build the assessment request.
      CreateAssessmentRequest createAssessmentRequest = CreateAssessmentRequest.newBuilder()
          .setParent(ProjectName.of(applicationProperties.getRecaptchaProjectId()).toString())
          .setAssessment(Assessment.newBuilder().setEvent(event).build())
          .build();

      Assessment response = client.createAssessment(createAssessmentRequest);

      client.close();

      // Check if the token is valid.
      if (response.getTokenProperties().getValid() && response.getRiskAnalysis().getScore() >= 0.5) {
        LOGGER.info("RECAPTCHA TOKEN VERIFIED SUCCESSFULLY. SCORE: " + response.getRiskAnalysis().getScore());
        return new ResponseEntity<>("Recaptcha successfully validated", HttpStatus.OK);
      } else {
        System.out.println(
            "The CreateAssessment call failed because the token was: "
                + response.getTokenProperties().getInvalidReason().name());
        throw new ValidationException("HTTP STATUS 400: CAPTCHA VALIDATION FAILED: " +
            response.getTokenProperties().getInvalidReason().name(), "400");
      }

    } catch (Exception e) {
      e.printStackTrace();
      throw new ValidationException("Validation failed");
    }
  }
}
