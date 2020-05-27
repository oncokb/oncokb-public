package org.mskcc.cbio.oncokb.service;

import io.github.jhipster.config.JHipsterProperties;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.domain.User;

import javax.mail.MessagingException;

import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.UserMailsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.internet.MimeMessage;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
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

    private static final String EXPIRE_IN_DAYS = "expiresInDays";
    private static final String EMAIL_TITLE = "emailTitle";

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
    public void sendEmail(String to, String from, String cc, String subject, String content, List<String> attachmentFilesNames, boolean isMultipart, boolean isHtml) throws MessagingException {
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

        if (attachmentFilesNames != null) {
            attachmentFilesNames.forEach(filename -> {
                try {
                    message.addAttachment(filename, new File(getClass().getClassLoader().getResource("files/" + filename).getFile()));
                } catch (MessagingException e) {
                    // having issue attach the file
                    e.printStackTrace();
                }
            });
        }
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
        sendEmailFromTemplate(user, mailType, null);
    }

    @Async
    public void sendEmailFromTemplate(UserDTO user, MailType mailType, Context additionalContext) {
        sendEmailFromTemplate(
            user, mailType,
            messageSource.getMessage(getTitleKeyByMailType(mailType).orElse(""), new Object[]{}, Locale.forLanguageTag(user.getLangKey())),
            jHipsterProperties.getMail().getFrom(), null, jHipsterProperties.getMail().getFrom(), additionalContext);
    }

    @Async
    public void sendEmailWithLicenseContext(UserDTO user, MailType mailType, String from, String cc, String by) {
        Context context = new Context();
        context.setVariable(LICENSE, user.getLicenseType().getName());
        sendEmailFromTemplate(user, mailType,
            messageSource.getMessage(getTitleKeyByMailType(mailType).orElse(""), new Object[]{user.getLicenseType().getName()}, Locale.forLanguageTag(user.getLangKey())),
            from, cc, by, context);
    }

    /**
     *
     * @param user UserDTO
     * @param mailType MailType
     * @param days Days to expire, must more than one day.
     */
    @Async
    public void sendEmailDeclareEmailOwnership(UserDTO user, MailType mailType, int days) {
        Context context = new Context();
        context.setVariable(EXPIRE_IN_DAYS, days);
        sendEmailFromTemplate(user, mailType,
            messageSource.getMessage(getTitleKeyByMailType(mailType).orElse(""), new Object[]{days}, Locale.forLanguageTag(user.getLangKey())),
            applicationProperties.getEmailAddresses().getRegistrationAddress(), null, null, context);
    }

    @Async
    public void sendEmailFromTemplate(UserDTO user, MailType mailType, String subject, String from, String cc, String by, Context additionalContext) {
        if (user.getEmail() == null) {
            log.debug("Email doesn't exist for user '{}'", user.getLogin());
            return;
        }
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());

        // Merge the additional context
        if (additionalContext != null)
            additionalContext.getVariableNames().forEach(name -> context.setVariable(name, additionalContext.getVariable(name)));

        String content = templateEngine.process("mail/" + mailType.getTemplateName(), context);
        try {
            if (from == null) {
                from = jHipsterProperties.getMail().getFrom();
            }
            if (by == null) {
                by = from;
            }
            List<String> attachmentFileNames = (mailType == null || mailType.getAttachmentFileNames() == null) ? null : Arrays.asList(StringUtils.split(mailType.getAttachmentFileNames(), ",")).stream().map(item -> item.trim()).collect(Collectors.toList());
            sendEmail(user.getEmail(), from, cc, subject, content, attachmentFileNames, (attachmentFileNames == null || attachmentFileNames.size() == 0) ? false : true, true);
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

    public MailType getIntakeFormMailType(LicenseType licenseType) {
        switch (licenseType) {
            case COMMERCIAL:
                return MailType.SEND_INTAKE_FORM_COMMERCIAL;
            case HOSPITAL:
                return MailType.SEND_INTAKE_FORM_HOSPITAL;
            case RESEARCH_IN_COMMERCIAL:
                return MailType.SEND_INTAKE_FORM_RESEARCH_COMMERCIAL;
            default:
                return null;
        }
    }
    public List<String> getMailFrom() {
        List<String> mailFrom = new ArrayList<>();
        mailFrom.add(applicationProperties.getEmailAddresses().getRegistrationAddress());
        mailFrom.add(applicationProperties.getEmailAddresses().getLicenseAddress());
        return mailFrom;
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
            case SEND_INTAKE_FORM_COMMERCIAL:
                return Optional.of("email.license.review.title");
            case SEND_INTAKE_FORM_HOSPITAL:
                return Optional.of("email.license.review.title");
            case SEND_INTAKE_FORM_RESEARCH_COMMERCIAL:
                return Optional.of("email.license.review.title");
            case CLARIFY_ACADEMIC_FOR_PROFIT:
                return Optional.of("email.license.clarify.title");
            case CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL:
                return Optional.of("email.license.clarify.title");
            case VERIFY_EMAIL_BEFORE_ACCOUNT_EXPIRES:
                return Optional.of("email.account.expires.by.days.title");
            default:
                return Optional.empty();

        }
    }
}
