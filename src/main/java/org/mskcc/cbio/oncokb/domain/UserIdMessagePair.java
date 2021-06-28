package org.mskcc.cbio.oncokb.domain;

import com.slack.api.model.Message;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class UserIdMessagePair {
    Long id;

    Message message;

    public UserIdMessagePair(long id, Message message) {
        this.id = id;
        this.message = message;
    }

    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

    public Message getMessage() { return message; }

    public void setMessage(Message message) { this.message = message; }
}
