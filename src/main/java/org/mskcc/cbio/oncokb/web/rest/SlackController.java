package org.mskcc.cbio.oncokb.web.rest;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.app_backend.views.payload.ViewSubmissionPayload;
import com.slack.api.util.json.GsonFactory;
import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONObject;
import org.mskcc.cbio.oncokb.domain.CompanyCandidate;
import org.mskcc.cbio.oncokb.domain.UnknownPayload;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.io.IOException;
import java.util.Optional;

@RestController
@ApiIgnore
@RequestMapping("/api")
public class SlackController {

    private final Logger log = LoggerFactory.getLogger(SlackController.class);

    private final SlackService slackService;

    private final UserService userService;

    @Autowired
    private UserMapper userMapper;

    private final UserRepository userRepository;

    private final MailService mailService;

    public SlackController(UserService userService, UserRepository userRepository, MailService mailService, SlackService slackService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.slackService = slackService;
    }

    // We do not put any auth protection for the slack call
    // Slack Interactivity Request URL does not provide an Auth option with bearer token.
    // It's overall not recommend to include sensitive data in the payload.
    // Considering faking a actionJSON with correct user email is difficult. Ignore the auth for now.
    @RequestMapping(method = RequestMethod.POST, value = "/slack", headers = {"content-type=application/x-www-form-urlencoded"})
    public ResponseEntity<String> approveUser(@RequestParam("payload") String actionJSON) throws IOException {
        Gson snakeCase = GsonFactory.createSnakeCase();
        UnknownPayload pl = snakeCase.fromJson(actionJSON, UnknownPayload.class);
        if (pl.getType().equals(BlockActionPayload.TYPE)) {
            BlockActionPayload blockActionPayload = snakeCase.fromJson(actionJSON, BlockActionPayload.class);
            ActionId actionId = this.slackService.getActionId(blockActionPayload);
            if (actionId == null
                || StringUtils.isEmpty(blockActionPayload.getResponseUrl())
                || StringUtils.isEmpty(blockActionPayload.getToken())
            ) {
                return new ResponseEntity<>("", HttpStatus.BAD_REQUEST);
            }
            BlockActionPayload.Action action = this.slackService.getAction(blockActionPayload, actionId).orElse(null);
            String login;
            if (actionId == ActionId.CHANGE_LICENSE_TYPE || ActionId.isDropdownAction(actionId)) {
                login = this.slackService.getOptionValueLogin(action.getSelectedOption().getValue());
            } else {
                login = action.getValue().toLowerCase();
            }

            Optional<User> user = userRepository.findOneByLogin(login);
            if (user.isPresent()) {
                UserDTO userDTO = userMapper.userToUserDTO(user.get());
                switch (actionId) {
                    case APPROVE_USER:
                        if (!userDTO.isActivated()) {
                            // If admin approves user for a micro company, then we need to associate the user with company
                            CompanyCandidate companyCandidate = userService.findCompanyCandidate(userDTO);
                            if(companyCandidate.getCompanyCandidate().isPresent() && !companyCandidate.getCanAssociate()){
                                Optional<UserDTO> updatedUserDTO = userService.updateUserWithCompanyLicense(userDTO, companyCandidate.getCompanyCandidate().get(), false);
                                if(updatedUserDTO.isPresent()){
                                    userDTO = updatedUserDTO.get();
                                }
                                break;
                            }
                            Optional<UserDTO> updatedUser = userService.approveUser(userDTO, false);
                            if (updatedUser.isPresent() && updatedUser.get().isActivated()) {
                                mailService.sendApprovalEmail(userDTO);
                            }
                        }
                        break;
                    case GIVE_TRIAL_ACCESS:
                        user = userService.initiateTrialAccountActivation(login);
                        userDTO = userMapper.userToUserDTO(user.get());
                        mailService.sendActiveTrialMail(userDTO, false);
                        break;
                    case CHANGE_LICENSE_TYPE:
                        String value = action.getSelectedOption().getValue();
                        LicenseType newLicenseType = LicenseType.valueOf(this.slackService.getOptionValueArgument(value));
                        userDTO.setLicenseType(newLicenseType);
                        this.userService.updateUser(userDTO);
                        break;
                    case CONVERT_TO_REGULAR_ACCOUNT:
                        userService.convertTrialUserToRegular(userDTO);
                        break;
                    default:
                        break;
                }
                this.slackService.sendLatestBlocks(blockActionPayload.getResponseUrl(), userDTO, userService.trialAccountActivated(userDTO), actionId, blockActionPayload.getTriggerId());
            }
        } else if (pl.getType().equals(ViewSubmissionPayload.TYPE)) {
            ViewSubmissionPayload viewSubmissionPayload = snakeCase.fromJson(actionJSON, ViewSubmissionPayload.class);
            ViewSubmissionPayload.ResponseUrl urlObject = new ViewSubmissionPayload.ResponseUrl();
            urlObject.setResponseUrl(slackService.getOptionValueArgument(viewSubmissionPayload.getView().getPrivateMetadata()));
            viewSubmissionPayload.getResponseUrls().add(urlObject);
            if (viewSubmissionPayload.getResponseUrls().stream().map(responseUrl -> responseUrl.getResponseUrl()).anyMatch(StringUtils::isEmpty)
                || StringUtils.isEmpty(viewSubmissionPayload.getToken())
            ) {
                return new ResponseEntity<>("", HttpStatus.BAD_REQUEST);
            }

            Optional<User> user = userRepository.findOneByLogin(slackService.getOptionValueLogin(viewSubmissionPayload.getView().getPrivateMetadata()));
            if (user.isPresent()) {
                UserDTO userDTO = userMapper.userToUserDTO(user.get());
                ActionId actionId = this.slackService.getActionId(viewSubmissionPayload);
                MailType mailType = null;
                switch (actionId) {
                    case CONFIRM_SEND_ACADEMIC_FOR_PROFIT_EMAIL:
                        mailType = MailType.CLARIFY_ACADEMIC_FOR_PROFIT;
                        break;
                    case CONFIRM_SEND_ACADEMIC_CLARIFICATION_EMAIL:
                        mailType = MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL;
                        break;
                    case CONFIRM_SEND_USE_CASE_CLARIFICATION_EMAIL:
                        mailType = MailType.CLARIFY_USE_CASE;
                        break;
                    case CONFIRM_SEND_DUPLICATE_USER_CLARIFICATION_EMAIL:
                        mailType = MailType.CLARIFY_DUPLICATE_USER;
                        break;
                    case CONFIRM_SEND_REJECTION_EMAIL:
                        mailType = MailType.REJECTION;
                        break;
                    case CONFIRM_SEND_REJECT_ALUMNI_ADDRESS_EMAIL:
                        mailType = MailType.REJECT_ALUMNI_ADDRESS;
                        break;
                }
                mailService.sendEmailFromSlack(userDTO,
                    viewSubmissionPayload.getView().getState().getValues().get(BlockId.SUBJECT_INPUT.getId()).get(ActionId.INPUT_SUBJECT.getId()).getValue(),
                    viewSubmissionPayload.getView().getState().getValues().get(BlockId.BODY_INPUT.getId()).get(ActionId.INPUT_BODY.getId()).getValue(),
                    mailType);
                this.slackService.sendLatestBlocks(
                    viewSubmissionPayload.getResponseUrls().get(0).getResponseUrl(),
                    userDTO,
                    userService.trialAccountActivated(userDTO),
                    ActionId.getById(viewSubmissionPayload.getView().getCallbackId()),
                    null);
            }
        }
        return new ResponseEntity<>("", HttpStatus.OK);
    }
}
