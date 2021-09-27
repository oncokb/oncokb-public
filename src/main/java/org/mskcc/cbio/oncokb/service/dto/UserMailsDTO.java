package org.mskcc.cbio.oncokb.service.dto;

import java.time.Instant;
import javax.validation.constraints.*;
import java.io.Serializable;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.UserMails} entity.
 */
public class UserMailsDTO implements Serializable {
    
    private Long id;

    @NotNull
    private Instant sentDate;

    @NotNull
    private String sentBy;

    private String mailType;

    @NotNull
    private String sentFrom;


    private Long userId;
    
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

    public String getMailType() {
        return mailType;
    }

    public void setMailType(String mailType) {
        this.mailType = mailType;
    }

    public String getSentFrom() {
        return sentFrom;
    }

    public void setSentFrom(String sentFrom) {
        this.sentFrom = sentFrom;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserMailsDTO)) {
            return false;
        }

        return id != null && id.equals(((UserMailsDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserMailsDTO{" +
            "id=" + getId() +
            ", sentDate='" + getSentDate() + "'" +
            ", sentBy='" + getSentBy() + "'" +
            ", mailType='" + getMailType() + "'" +
            ", sentFrom='" + getSentFrom() + "'" +
            ", userId=" + getUserId() +
            "}";
    }
}
