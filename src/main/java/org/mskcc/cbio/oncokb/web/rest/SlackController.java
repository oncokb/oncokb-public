package org.mskcc.cbio.oncokb.web.rest;

import com.google.gson.Gson;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.app_backend.views.payload.ViewSubmissionPayload;
import com.slack.api.util.json.GsonFactory;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.domain.CompanyCandidate;
import org.mskcc.cbio.oncokb.domain.UnknownPayload;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.security.AuthoritiesConstants;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.mskcc.cbio.oncokb.web.rest.slack.BlockId;
import org.mskcc.cbio.oncokb.web.rest.slack.DropdownEmailOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.Optional;
import java.util.Set;

@RestController
@ApiIgnore
@RequestMapping("/api")
public class SlackController {

    private final Logger log = LoggerFactory.getLogger(SlackController.class);

    private final SlackService slackService;

    private final UserService userService;

    private final UserMapper userMapper;

    private final UserRepository userRepository;

    private final MailService mailService;

    public SlackController(UserService userService, UserRepository userRepository, MailService mailService, SlackService slackService, UserMapper userMapper) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.slackService = slackService;
        this.userMapper = userMapper;
    }

    private void updateUserWithRoleApiIfRequested(UserDTO userDTO) {
        boolean apiAccessRequested = userDTO.getAdditionalInfo() != null && userDTO.getAdditionalInfo().getApiAccessRequest() != null && userDTO.getAdditionalInfo().getApiAccessRequest().isRequested();
        if (!userDTO.getLicenseType().equals(LicenseType.ACADEMIC) || apiAccessRequested) {
            Set<String> userDTOAuthorities = userDTO.getAuthorities();
            userDTOAuthorities.add(AuthoritiesConstants.API);
        }
    }

    // We do not put any auth protection for the slack call
    // Slack Interactivity Request URL does not provide an Auth option with bearer token.
    // It's overall not recommend to include sensitive data in the payload.
    // Considering faking a actionJSON with correct user email is difficult. Ignore the auth for now.
    @RequestMapping(method = RequestMethod.POST, value = "/slack", headers = {"content-type=application/x-www-form-urlencoded"})
    public ResponseEntity<String> approveUser(@RequestParam("payload") String actionJSON) throws IOException, MessagingException {
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

            Optional<User> user = userRepository.findOneWithAuthoritiesByLogin(login);
            if (user.isPresent()) {
                UserDTO userDTO = userMapper.userToUserDTO(user.get());
                switch (actionId) {
                    case APPROVE_USER:
                        if (!userDTO.isActivated()) {
                            // If admin approves user for a limited company, then we need to associate the user with company
                            CompanyCandidate companyCandidate = userService.findCompanyCandidate(userDTO);
                            if(companyCandidate.getCompanyCandidate().isPresent() && !companyCandidate.getCanAssociate()){
                                Optional<UserDTO> updatedUserDTO = userService.updateUserWithCompanyLicense(userDTO, companyCandidate.getCompanyCandidate().get(), false, false);
                                if(updatedUserDTO.isPresent()){
                                    userDTO = updatedUserDTO.get();
                                }
                            }

                            updateUserWithRoleApiIfRequested(userDTO);

                            Optional<UserDTO> updatedUser = userService.approveUser(userDTO, false);
                            if (updatedUser.isPresent() && updatedUser.get().isActivated()) {
                                mailService.sendApprovalEmail(userDTO);
                            }
                        }
                        break;
                    case APPROVE_USER_FOR_API_ACCESS:
                        boolean userAlreadyHasRoleApi = userDTO.getAuthorities().contains(AuthoritiesConstants.API);

                        updateUserWithRoleApiIfRequested(userDTO);

                        Optional<UserDTO> updatedUser = userService.updateUserAndTokens(userDTO);
                        if (updatedUser.isPresent() && updatedUser.get().isActivated() && !userAlreadyHasRoleApi) {
                            mailService.sendApiAccessApprovalEmail(userDTO);
                        }
                        break;
                    case GIVE_TRIAL_ACCESS:
                        user = userService.initiateTrialAccountActivation(login);
                        userDTO = userMapper.userToUserDTO(user.get());

                        updateUserWithRoleApiIfRequested(userDTO);

                        Optional<UserDTO> updatedTrialUser = userService.updateUserBeforeTrialAccountActivation(userDTO);
                        if (updatedTrialUser.isPresent()) {
                            userDTO = updatedTrialUser.get();
                        }

                        mailService.sendActiveTrialMail(userDTO, false);
                        break;
                    case CHANGE_LICENSE_TYPE:
                        String value = action.getSelectedOption().getValue();
                        LicenseType newLicenseType = LicenseType.valueOf(this.slackService.getOptionValueArgument(value));
                        userDTO.setLicenseType(newLicenseType);
                        this.userService.updateUserAndTokens(userDTO);
                        break;
                    case CONVERT_TO_REGULAR_ACCOUNT:
                        userService.convertUserToRegular(userDTO);
                        break;
                    default:
                        break;
                }
                this.slackService.sendLatestBlocks(blockActionPayload.getResponseUrl(), userDTO, userService.isUserOnTrial(userDTO), actionId, blockActionPayload.getTriggerId());
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

            Optional<User> user = userRepository.findOneWithAuthoritiesByLogin(slackService.getOptionValueLogin(viewSubmissionPayload.getView().getPrivateMetadata()));
            if (user.isPresent()) {
                UserDTO userDTO = userMapper.userToUserDTO(user.get());
                ActionId actionId = this.slackService.getActionId(viewSubmissionPayload);
                DropdownEmailOption mailOption = null;
                for (DropdownEmailOption curMailOption : DropdownEmailOption.values()) {
                    if (actionId == (curMailOption.getConfirmActionId().orElse(null)))
                        mailOption = curMailOption;
                }
                mailService.sendEmailFromSlack(userDTO,
                    viewSubmissionPayload.getView().getState().getValues().get(BlockId.SUBJECT_INPUT.getId()).get(ActionId.INPUT_SUBJECT.getId()).getValue(),
                    viewSubmissionPayload.getView().getState().getValues().get(BlockId.BODY_INPUT.getId()).get(ActionId.INPUT_BODY.getId()).getValue(),
                    mailOption.getMailType(), viewSubmissionPayload.getUser().getName());
                this.slackService.sendLatestBlocks(
                    viewSubmissionPayload.getResponseUrls().get(0).getResponseUrl(),
                    userDTO,
                    userService.isUserOnTrial(userDTO),
                    ActionId.getById(viewSubmissionPayload.getView().getCallbackId()),
                    null);
            }
        }
        return new ResponseEntity<>("", HttpStatus.OK);
    }
}
