package org.mskcc.cbio.oncokb.domain;

import com.slack.api.model.Message;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class EmailMessagePair {
    String email;

    Message message;

    public EmailMessagePair(String email, Message message) {
        this.email = email;
        this.message = message;
    }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public Message getMessage() { return message; }

    public void setMessage(Message message) { this.message = message; }
}
