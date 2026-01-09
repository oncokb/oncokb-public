package org.mskcc.cbio.oncokb.service.dto;

import java.io.Serializable;
import java.time.LocalDate;
import javax.validation.constraints.*;
import org.mskcc.cbio.oncokb.domain.UserBannerMessage;
import org.mskcc.cbio.oncokb.domain.enumeration.BannerType;
import org.mskcc.cbio.oncokb.domain.enumeration.UserBannerMessageStatus;

/**
 * A DTO for the {@link org.mskcc.cbio.oncokb.domain.UserBannerMessage} entity.
 */
public class UserBannerMessageDTO implements Serializable {
  private Long id;

  private LocalDate startDate;

  private LocalDate endDate;

  @NotNull
  @Size(min = 1)
  private String content;

  @NotNull
  private BannerType bannerType;

  private UserBannerMessageStatus status;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public BannerType getBannerType() {
    return bannerType;
  }

  public void setBannerType(BannerType bannerType) {
    this.bannerType = bannerType;
  }

  public UserBannerMessageStatus getStatus() {
    return status;
  }

  public void setStatus(UserBannerMessageStatus status) {
    this.status = status;
  }

  // prettier-ignore
    @Override
    public String toString() {
        return "UserBannerMessageDTO{" +
            "id=" + id +
            ", startDate=" + startDate +
            ", endDate=" + endDate +
            ", content='" + content + '\'' +
            ", bannerType=" + bannerType +
            ", status=" + status +
            "}";
    }
}
