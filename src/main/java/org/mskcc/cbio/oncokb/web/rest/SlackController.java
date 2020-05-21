package org.mskcc.cbio.oncokb.web.rest;

import com.github.seratch.jslack.app_backend.interactive_messages.payload.BlockActionPayload;
import com.github.seratch.jslack.common.json.GsonFactory;
import com.google.gson.Gson;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.repository.UserRepository;
import org.mskcc.cbio.oncokb.service.MailService;
import org.mskcc.cbio.oncokb.service.SlackService;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

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
    public ResponseEntity<String> approveUser(@RequestParam("payload") String actionJSON) {
        Gson snakeCase = GsonFactory.createSnakeCase();
        BlockActionPayload pl = snakeCase.fromJson(actionJSON, BlockActionPayload.class);
        Optional<BlockActionPayload.Action> actionOptional = slackService.getApproveUserAction(pl);
        if (actionOptional.isPresent()) {
            BlockActionPayload.Action action = actionOptional.get();

            Optional<User> existingUser = userRepository.findOneByLogin(action.getValue().toLowerCase());
            if (existingUser.isPresent()) {
                UserDTO userDTO = userMapper.userToUserDTO(existingUser.get());
                if (!userDTO.isActivated()) {
                    userDTO.setActivated(true);
                    Optional<UserDTO> updatedUser = userService.updateUser(userDTO);
                    if (updatedUser.isPresent() && updatedUser.get().isActivated()) {
                        mailService.sendApprovalEmail(userDTO);
                        slackService.sendApprovedConfirmation(updatedUser.get(), pl);
                    }
                } else {
                    slackService.sendApprovedConfirmation(userDTO, pl);
                }
            }
        }
        return new ResponseEntity<>("", HttpStatus.OK);
    }
}
