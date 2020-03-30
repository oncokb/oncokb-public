package org.mskcc.cbio.oncokb.service.dto;

import java.time.Instant;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.UserMails} entity.
 */
public class UserMailsDTO implements Serializable {
    
    private Long id;

    @NotNull
    private Instant sentDate;

    @NotNull
    private String sentBy;

    @NotNull
    private String sentFrom;

    private MailType mailType;


    private Long userId;

    private String userLogin;
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getSentDate() {
        return sentDate;
    }

    public void setSentDate(Instant sentDate) {
        this.sentDate = sentDate;
    }

    public String getSentBy() {
        return sentBy;
    }

    public void setSentBy(String sentBy) {
        this.sentBy = sentBy;
    }

    public String getSentFrom() {
        return sentFrom;
    }

    public void setSentFrom(String sentFrom) {
        this.sentFrom = sentFrom;
    }

    public MailType getMailType() {
        return mailType;
    }

    public void setMailType(MailType mailType) {
        this.mailType = mailType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        UserMailsDTO userMailsDTO = (UserMailsDTO) o;
        if (userMailsDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), userMailsDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "UserMailsDTO{" +
            "id=" + getId() +
            ", sentDate='" + getSentDate() + "'" +
            ", sentBy='" + getSentBy() + "'" +
            ", sentFrom='" + getSentFrom() + "'" +
            ", mailType='" + getMailType() + "'" +
            ", user=" + getUserId() +
            ", user='" + getUserLogin() + "'" +
            "}";
    }
}
