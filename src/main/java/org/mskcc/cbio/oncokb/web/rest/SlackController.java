package org.mskcc.cbio.oncokb.web.rest;

import com.google.gson.Gson;
import com.slack.api.Slack;
import com.slack.api.app_backend.interactive_components.payload.BlockActionPayload;
import com.slack.api.model.Option;
import com.slack.api.model.block.Blocks;
import com.slack.api.model.block.LayoutBlock;
import com.slack.api.util.json.GsonFactory;
import com.slack.api.webhook.Payload;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.web.rest.slack.ActionId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.io.IOException;
import java.util.List;
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
        BlockActionPayload pl = snakeCase.fromJson(actionJSON, BlockActionPayload.class);
        ActionId actionId = this.slackService.getActionId(pl);

        if (actionId == null || StringUtils.isEmpty(pl.getResponseUrl()) || StringUtils.isEmpty(pl.getToken())) {
            return new ResponseEntity<>("", HttpStatus.BAD_REQUEST);
        }

        BlockActionPayload.Action action = this.slackService.getAction(pl, actionId).orElse(null);
        String login;
        if (actionId == ActionId.CHANGE_LICENSE_TYPE) {
            login = this.slackService.getOptionValueLogin(action.getSelectedOption().getValue());
        } else {
            login = action.getValue().toLowerCase();
        }
        Optional<User> user = action == null ? Optional.empty() : userRepository.findOneByLogin(login);
        if (user.isPresent()) {
            UserDTO userDTO = userMapper.userToUserDTO(user.get());
            switch (actionId) {
                case APPROVE_USER:
                    if (!userDTO.isActivated()) {
                        Optional<UserDTO> updatedUser = userService.approveUser(userDTO);
                        if (updatedUser.isPresent() && updatedUser.get().isActivated()) {
                            mailService.sendApprovalEmail(userDTO);
                        }
                    }
                    break;
                case GIVE_TRIAL_ACCESS:
                    user = userService.initiateTrialAccountActivation(action.getValue().toLowerCase());
                    userDTO = userMapper.userToUserDTO(user.get());
                    mailService.sendActiveTrialMail(userDTO, false);
                    break;
                case CHANGE_LICENSE_TYPE:
                    String value = action.getSelectedOption().getValue();
                    LicenseType newLicenseType = LicenseType.valueOf(this.slackService.getOptionValueLicenseType(value));
                    userDTO.setLicenseType(newLicenseType);
                    this.userService.updateUser(userDTO);
                    break;
                case CONVERT_TO_REGULAR_ACCOUNT:
                    userService.convertTrialUserToRegular(userDTO);
                    break;
                case UPDATE_USER:
                    break;
                default:
                    break;
            }
            this.slackService.sendLatestBlocks(pl.getResponseUrl(), userDTO, userService.isTrialAccount(userDTO), userService.trialAccountInitiated(userDTO), pl);
        }
        return new ResponseEntity<>("", HttpStatus.OK);
    }
}
