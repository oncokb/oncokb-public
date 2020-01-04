package org.mskcc.cbio.oncokb.service;

import io.github.jhipster.config.JHipsterProperties;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.User;

import javax.mail.MessagingException;

import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for sending emails.
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class MailService {

    private final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String USER = "user";

    private static final String BASE_URL = "baseUrl";

    private static final String LICENSE = "license";

    private final JHipsterProperties jHipsterProperties;

    private final ApplicationProperties applicationProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    private final UserMailsService userMailsService;

    public MailService(JHipsterProperties jHipsterProperties, JavaMailSender javaMailSender,
                       MessageSource messageSource, SpringTemplateEngine templateEngine,
                       UserMailsService userMailsService, ApplicationProperties applicationProperties
    ) {

        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
        this.userMailsService = userMailsService;
        this.applicationProperties = applicationProperties;
    }

    private static class UnknownMailTypeException extends RuntimeException {
        private UnknownMailTypeException() {
            super("Cannot identify the MailType.");
        }
    }

    @Async
    public void sendEmail(String to, String from, String cc, String subject, String content, boolean isMultipart, boolean isHtml) throws MessagingException {
        log.debug("Send email[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart, isHtml, to, subject, content);

        // Prepare message using a Spring helper
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
        message.setTo(to);
        if (cc != null) {
            message.setCc(cc);
        }
        message.setFrom(from);
        message.setSubject(subject);
        message.setText(content, isHtml);
        javaMailSender.send(mimeMessage);
    }

    private void addUserMailsRecord(UserDTO userDTO, MailType mailType, String sentFrom, String sentBy) {
        UserMailsDTO userMailsDTO = new UserMailsDTO();
        userMailsDTO.setMailType(mailType);
        userMailsDTO.setSentDate(Instant.now());
        userMailsDTO.setSentFrom(sentFrom);
        userMailsDTO.setSentBy(sentBy);
        userMailsDTO.setUserId(userDTO.getId());
        userMailsService.save(userMailsDTO);
    }

    @Async
    public void sendEmailFromTemplate(UserDTO user, MailType mailType) {
        sendEmailFromTemplate(user, mailType, jHipsterProperties.getMail().getFrom(), null, jHipsterProperties.getMail().getFrom());
    }

    @Async
    public void sendEmailFromTemplate(UserDTO user, MailType mailType, String from, String cc, String by) {
        if (user.getEmail() == null) {
            log.debug("Email doesn't exist for user '{}'", user.getLogin());
            return;
        }
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        context.setVariable(LICENSE, user.getLicenseType().getName());
        String content = templateEngine.process("mail/" + mailType.getTemplateName(), context);
        String subject = messageSource.getMessage(getTitleKeyByMailType(mailType).orElseThrow(() -> new UnknownMailTypeException()), new Object[]{user.getLicenseType().getName()}, locale);
        try {
            if (from == null) {
                from = jHipsterProperties.getMail().getFrom();
            }
            if (by == null) {
                by = from;
            }
            sendEmail(user.getEmail(), from, cc, subject, content, false, true);
            addUserMailsRecord(user, mailType, from, by);
            log.info("Sent email to User '{}'", user.getEmail());
        } catch (MailException | MessagingException e) {
            log.warn("Email could not be sent to user '{}'", user.getEmail(), e);
        }
    }

    @Async
    public void sendActivationEmail(UserDTO user) {
        log.debug("Sending activation email to '{}'", user.getEmail());
        sendEmailFromTemplate(user, MailType.ACTIVATION);
    }

    @Async
    public void sendCreationEmail(UserDTO user) {
        log.debug("Sending creation email to '{}'", user.getEmail());
        sendEmailFromTemplate(user, MailType.CREATION);
    }

    @Async
    public void sendApprovalEmail(UserDTO user) {
        log.debug("Sending approval email to '{}'", user.getEmail());
        sendEmailFromTemplate(user, MailType.APPROVAL);
    }

    @Async
    public void sendPasswordResetMail(UserDTO user) {
        log.debug("Sending password reset email to '{}'", user.getEmail());
        sendEmailFromTemplate(user, MailType.PASSWORD_RESET);
    }

    @Async
    public void sendCommercialLicenseReview(UserDTO user) {
        log.debug("Sending commercial license review email to '{}'", user.getEmail());
        sendEmailFromTemplate(user, MailType.LICENSE_REVIEW_COMMERCIAL);
    }

    public List<String> getMailFrom() {
        return Arrays.stream(applicationProperties.getMailFrom().split(",")).map(from -> from.trim()).collect(Collectors.toList());
    }

    private Optional<String> getTitleKeyByMailType(MailType mailType) {
        if (mailType == null) {
            return Optional.empty();
        }
        switch (mailType) {
            case ACTIVATION:
                return Optional.of("email.activation.title");
            case CREATION:
                return Optional.of("email.activation.title");
            case APPROVAL:
                return Optional.of("email.approval.title");
            case PASSWORD_RESET:
                return Optional.of("email.reset.title");
            case LICENSE_REVIEW_COMMERCIAL:
                return Optional.of("email.license.review.title");
            case LICENSE_REVIEW_HOSPITAL:
                return Optional.of("email.license.review.title");
            case LICENSE_REVIEW_RESEARCH_COMMERCIAL:
                return Optional.of("email.license.review.title");
            case CLARIFY_ACADEMIC_FOR_PROFIT:
                return Optional.of("email.license.clarify.title");
            case CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL:
                return Optional.of("email.license.clarify.title");
            default:
                return Optional.empty();

        }
    }
}
