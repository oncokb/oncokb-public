package org.mskcc.cbio.oncokb.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;

/**
 * A UserMails.
 */
@Entity
@Table(name = "user_mails")
public class UserMails implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "sent_date", nullable = false)
    private Instant sentDate;

    @NotNull
    @Column(name = "sent_by", nullable = false)
    private String sentBy;

    @Column(name = "mail_type")
    private String mailType;

    @NotNull
    @Column(name = "sent_from", nullable = false)
    private String sentFrom;

    @ManyToOne
    @JsonIgnoreProperties(value = "userMails", allowSetters = true)
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getSentDate() {
        return sentDate;
    }

    public UserMails sentDate(Instant sentDate) {
        this.sentDate = sentDate;
        return this;
    }

    public void setSentDate(Instant sentDate) {
        this.sentDate = sentDate;
    }

    public String getSentBy() {
        return sentBy;
    }

    public UserMails sentBy(String sentBy) {
        this.sentBy = sentBy;
        return this;
    }

    public void setSentBy(String sentBy) {
        this.sentBy = sentBy;
    }

    public String getMailType() {
        return mailType;
    }

    public UserMails mailType(String mailType) {
        this.mailType = mailType;
        return this;
    }

    public void setMailType(String mailType) {
        this.mailType = mailType;
    }

    public String getSentFrom() {
        return sentFrom;
    }

    public UserMails sentFrom(String sentFrom) {
        this.sentFrom = sentFrom;
        return this;
    }

    public void setSentFrom(String sentFrom) {
        this.sentFrom = sentFrom;
    }

    public User getUser() {
        return user;
    }

    public UserMails user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserMails)) {
            return false;
        }
        return id != null && id.equals(((UserMails) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserMails{" +
            "id=" + getId() +
            ", sentDate='" + getSentDate() + "'" +
            ", sentBy='" + getSentBy() + "'" +
            ", mailType='" + getMailType() + "'" +
            ", sentFrom='" + getSentFrom() + "'" +
            "}";
    }
}