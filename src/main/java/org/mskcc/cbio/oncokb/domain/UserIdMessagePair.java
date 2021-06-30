package org.mskcc.cbio.oncokb.domain;

import com.slack.api.model.Message;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class UserIdMessagePair {
    Long id;

    Message message;

    public UserIdMessagePair(Long id, Message message) {
        this.id = id;
        this.message = message;
    }

    public long getId() { return id; }

    public Message getMessage() { return message; }
}
