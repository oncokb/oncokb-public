package org.mskcc.cbio.oncokb.domain;

import com.slack.api.model.Message;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;

import java.util.Objects;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class UserMessagePair {
    UserDTO userDTO;

    Message message;

    final String dateCreated;

    final String dateLastReplied;

    public UserMessagePair(UserDTO userDTO, Message message) {
        this.userDTO = userDTO;
        this.message = message;
        dateCreated = new java.util.Date((long) Double.parseDouble(message.getTs()) * 1000).toString();
        if (Objects.nonNull(message.getLatestReply())) {
            dateLastReplied = new java.util.Date((long) (Double.parseDouble(message.getLatestReply()) * 1000)).toString();
        } else {
            dateLastReplied = "n/a";
        }
    }

    public UserDTO getUserDTO() { return userDTO; }

    public Message getMessage() { return message; }

    public String getDateCreated() { return dateCreated; }

    public String getDateLastReplied() { return dateLastReplied; }
}
