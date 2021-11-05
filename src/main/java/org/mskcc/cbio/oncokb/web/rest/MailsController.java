package org.mskcc.cbio.oncokb.web.rest;

import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.domain.MailTypeInfo;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.validation.Valid;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    public MailsController(MailService mailService, UserService userService, UserMapper userMapper) {
        this.mailService = mailService;
        this.userService = userService;
        this.userMapper = userMapper;
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
        String emailContenet = description;
        if (StringUtils.isNotEmpty(userName)) {
            emailContenet += "\n\n" + userName;
        }
        if (StringUtils.isNotEmpty(from)) {
            emailContenet = " (" + from + ")";
        }
        this.mailService.sendFeedback(from, subject, emailContenet);
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
            mailTypeInfos.add(new MailTypeInfo(mailType));
        }
        return mailTypeInfos;
    }

}
