package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

/**
 * Created by Benjamin Xu on 6/22/21.
 */
public class MessageDTO {
    String messageTS;

    String messageID;

    public MessageDTO(String messageTS) {
        setMessageTS(messageTS);
    }

    public String getMessageTS() { return messageTS; }

    public void setMessageTS(String messageTS) {
        this.messageTS = messageTS;
        messageID = "p" + messageTS.substring(0, 10) + messageTS.substring(11, 17);
    }

    public String getMessageID() { return messageID; }

    public void setMessageID(String messageID) {
        this.messageID = messageID;
        messageTS = messageID.substring(1,11) + "." + messageID.substring(11, 17);
    }
}
