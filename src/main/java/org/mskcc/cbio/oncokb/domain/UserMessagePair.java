package org.mskcc.cbio.oncokb.domain;

import com.slack.api.model.Message;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class UserMessagePair {
    UserDTO userDTO;

    Message message;

    public UserMessagePair(UserDTO userDTO, Message message) {
        this.userDTO = userDTO;
        this.message = message;
    }

    public UserDTO getUserDTO() { return userDTO; }

    public void setUserDTO(UserDTO userDTO) { this.userDTO = userDTO; }

    public Message getMessage() { return message; }

    public void setMessage(Message message) { this.message = message; }
}
