package org.mskcc.cbio.oncokb.domain;

import com.fasterxml.jackson.annotation.*;
import java.time.*;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.mskcc.cbio.oncokb.domain.enumeration.BannerType;

@Entity
@Table(name = "user_banner_message")
public class UserBannerMessage {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "start_date")
  private LocalDate startDate;

  @Column(name = "end_date")
  private LocalDate endDate;

  @NotNull
  @Column(name = "content", nullable = false)
  private String content;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(name = "banner_type", nullable = false)
  private BannerType bannerType;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  // Hibernate stores LocalDate as LocalDateTime internally, so it implicitly
  // applies the default timezone offset and can push the calendar date forward
  // or backward. The conversion helpers below recover the original date.
  private static LocalDate recoverUtcDate(LocalDate localDate) {
    if (localDate == null) {
      return null;
    }
    // Figure out how many hours the JVM's default zone is offset from UTC for the
    // provided date (DST can make this vary through the year).
    int todaysOffset = localDate
      .atStartOfDay(ZoneId.of("UTC"))
      .withZoneSameInstant(ZoneOffset.systemDefault())
      .getHour();

    // Shift the date by that offset in the default zone and then convert back to UTC.
    // This mirrors the conversion Hibernate performs when it mistakenly treats the
    // LocalDate as a LocalDateTime, effectively undoing the offset it applied.
    return localDate
      .atStartOfDay(ZoneOffset.systemDefault())
      .withHour(todaysOffset)
      .withZoneSameInstant(ZoneOffset.UTC)
      .toLocalDate();
  }

  public LocalDate getStartDate() {
    return recoverUtcDate(startDate);
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return recoverUtcDate(endDate);
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
}
