package org.mskcc.cbio.oncokb.web.rest;

import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.mail.MessagingException;
import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.EmailAddresses;
import org.mskcc.cbio.oncokb.domain.MailTypeInfo;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.service.CompanyService;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.TerminationEmailDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo.CompanyAdditionalInfoDTO;
import org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo.CompanyLicense;
import org.mskcc.cbio.oncokb.service.dto.companyadditionalinfo.CompanyTermination;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.mskcc.cbio.oncokb.web.rest.vm.CompanyVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.mskcc.cbio.oncokb.config.Constants;
import org.thymeleaf.context.Context;

/**
 * REST controller for managing mails.
 */
@RestController
@RequestMapping("/api")
public class MailsController {

    private final Logger log = LoggerFactory.getLogger(MailsController.class);

    private final MailService mailService;

    private final UserService userService;

    private final UserMapper userMapper;

    private final CompanyService companyService;

    private final ApplicationProperties applicationProperties;

    public MailsController(MailService mailService, UserService userService, UserMapper userMapper, CompanyService companyService, ApplicationProperties applicationProperties) {
        this.mailService = mailService;
        this.userService = userService;
        this.userMapper = userMapper;
        this.companyService = companyService;
        this.applicationProperties = applicationProperties;
    }

    /**
     * {@code POST  /mails} : Send user emails.
     *
     * @param to       send to.
     * @param from     send from.
     * @param by       the admin who triggers the mail to be sent.
     * @param mailType the type of mail to be sent.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userMailsDTO, or with status {@code 400 (Bad Request)} if the userMails has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/mails/users")
    public ResponseEntity<String> sendUserMails(
        @Valid @RequestParam String from,
        @Valid @RequestParam String to,
        @RequestParam(required = false) String cc,
        @RequestParam String by,
        @Valid @RequestParam MailType mailType
    ) {
        Optional<User> user = this.userService.getUserWithAuthoritiesByEmailIgnoreCase(to);
        if (user.isPresent()) {
            mailService.sendEmailWithLicenseContext(userMapper.userToUserDTO(user.get()), mailType, from, cc, by);
            return ResponseEntity.ok().build();
        } else {
            throw new BadRequestAlertException("The user does not exist.");
        }
    }

    @PostMapping("/mails/feedback")
    public ResponseEntity<Void> sendFeedbackMails(
        @Valid @RequestParam String subject,
        @Valid @RequestParam String description,
        @Valid @RequestParam String from,
        @RequestParam String userName
    ) throws MessagingException {
        String emailContent = description;
        if (StringUtils.isNotEmpty(userName)) {
            emailContent += "\n\n" + userName;
        }
        if (StringUtils.isNotEmpty(from)) {
            emailContent += " (" + from + ")";
        }
        this.mailService.sendFeedback(from, subject, emailContent);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * {@code GET  /mails/from} : Get a list of mail addresses can be used as sender.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (Success)} and with body the list of senders String
     */
    @GetMapping("/mails/from")
    public List<String> getMailsFrom() {
        return mailService.getMailFrom();
    }

    /**
     * {@code GET  /mails/types} : Get a list of mail types.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (Success)} and with body the list of mail types String
     */
    @GetMapping("/mails/types")
    public List<MailTypeInfo> getMailsTypes() {
        List<MailTypeInfo> mailTypeInfos = new ArrayList<>();
        for (MailType mailType : MailType.values()) {
            if (MailType.TEST.equals(mailType)) {
                continue;
            }
            mailTypeInfos.add(new MailTypeInfo(mailType));
        }
        return mailTypeInfos;
    }

    @GetMapping("mails/termination-warning/{companyId}")
    public TerminationEmailDTO getTerminationWarningEmail(@PathVariable Long companyId) {
        CompanyDTO company = this.companyService.findOne(companyId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<UserDTO> users = this.userService.getCompanyUsers(companyId);

        String formattedDate;

        try {
            Instant date = company.getAdditionalInfo().getLicense().getTermination().getDate();
            ZonedDateTime zoned = date.atZone(ZoneId.of(Constants.NY_ZONE_ID));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
            formattedDate = formatter.format(zoned);
        } catch (NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please save the termination date first.");
        }

        EmailAddresses addresses = this.applicationProperties.getEmailAddresses();

        String from = addresses.getLicenseAddress();
        String cc = addresses.getLicenseAddress();
        String bcc = users.stream().map(UserDTO::getEmail).collect(Collectors.joining(";"));
        String subject = "Urgent: OncoKB API License Expiration on " + formattedDate + " - Action Required";
        String content = "Dear " + company.getName() + ",\n\n" +
                "We are writing to inform you that your API license for OncoKB is set to expire on " + formattedDate + ".\n\n" +
                "If you would like to continue using OncoKB, please let us know, and we will work with your company’s representative to facilitate the license renewal.\n\n" +
                "Regards,\n" +
                "The OncoKB Team";

        TerminationEmailDTO dto = new TerminationEmailDTO();
        dto.setSubject(subject);
        dto.setFrom(from);
        dto.setCc(cc);
        dto.setBcc(bcc);
        dto.setCompanyId(companyId);
        dto.setContent(content);
        return dto;
    }

    @PostMapping("mails/company-termination-warning")
    public void sendTerminationWarningEmail(@Valid @RequestBody TerminationEmailDTO terminationEmailDTO) throws MessagingException {
        this.mailService.sendEmail(terminationEmailDTO);
    }

    @PostMapping("mails/company-termination-notification")
    public void sendTerminationNotificationEmail(@Valid @RequestBody List<Long> companyIds) throws MessagingException {
        List<CompanyDTO> companiesToNotify =  companyService.findCompaniesByIds(companyIds);
        EmailAddresses addresses = this.applicationProperties.getEmailAddresses();
        Context context = new Context();
        final String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        context.setVariable("baseUrl", baseUrl);
        context.setVariable("companies", companiesToNotify);
        String to = addresses.getLicenseAddress();
        mailService.sendInternalEmailFromTemplate(MailType.TERMINATION_NOTIFICATION_EMAIL, "Licenses are about to expire.", to, context);

        for (CompanyDTO company : companiesToNotify) {
            if (company.getAdditionalInfo() == null) {
                company.setAdditionalInfo(new CompanyAdditionalInfoDTO());
            }

            CompanyAdditionalInfoDTO additionalInfoDTO = company.getAdditionalInfo();

            if (additionalInfoDTO.getLicense() == null) {
                additionalInfoDTO.setLicense(new CompanyLicense());
            }

            CompanyLicense license = additionalInfoDTO.getLicense();

            if (license.getTermination() == null) {
                license.setTermination(new CompanyTermination());
            }

            CompanyTermination termination = license.getTermination();

            termination.setHasBeenNotified(true);

            CompanyVM companyVM = new CompanyVM();
            companyVM.setId(company.getId());
            companyVM.setName(company.getName());
            companyVM.setDescription(company.getDescription());
            companyVM.setCompanyType(company.getCompanyType());
            companyVM.setLicenseType(company.getLicenseType());
            companyVM.setLicenseModel(company.getLicenseModel());
            companyVM.setLicenseStatus(company.getLicenseStatus());
            companyVM.setBusinessContact(company.getBusinessContact());
            companyVM.setLegalContact(company.getLegalContact());
            companyVM.setCompanyDomains(company.getCompanyDomains());
            companyVM.setAdditionalInfo(company.getAdditionalInfo());

            companyService.updateCompany(companyVM);
        }

    }
}
