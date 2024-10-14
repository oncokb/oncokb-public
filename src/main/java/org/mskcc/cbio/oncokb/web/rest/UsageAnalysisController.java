package org.mskcc.cbio.oncokb.web.rest;

import static org.mskcc.cbio.oncokb.config.Constants.*;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.time.Clock;
import java.time.Period;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.AbstractMap.SimpleEntry;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.FileExtension;
import org.mskcc.cbio.oncokb.service.S3Service;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.util.TimeUtil;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageSummary;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserOverviewUsage;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserStats;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserUsage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Controller
@RequestMapping("/api")
public class UsageAnalysisController {
  @Autowired
  private S3Service s3Service;

  @Autowired
  private UserService userService;

  @Autowired
  private UserMapper userMapper;

  @Autowired
  private Clock clock;

  private JSONObject requestData(String file)
    throws UnsupportedEncodingException, IOException, ParseException {
    Optional<ResponseInputStream<GetObjectResponse>> s3object = s3Service.getObject(
      Constants.ONCOKB_S3_BUCKET,
      file
    );
    if (s3object.isPresent()) {
      ResponseInputStream<GetObjectResponse> inputStream = s3object.get();
      JSONParser jsonParser = new JSONParser();
      return (JSONObject) jsonParser.parse(
        new InputStreamReader(inputStream, "UTF-8")
      );
    }
    return null;
  }

  private Map<String, JSONObject> getMonthSummaries(String filePrefix)
    throws UnsupportedEncodingException, IOException, ParseException {
    Map<String, JSONObject> monthSummaries = new HashMap<>();

    ZonedDateTime today = TimeUtil.getCurrentNYTime(clock);
    ZonedDateTime startDate = today.minusYears(3).withDayOfYear(1).minusDays(1);

    long totalMonthsToGoBack = Period
      .between(startDate.toLocalDate(), today.toLocalDate())
      .toTotalMonths();

    for (long monthsBack = 0; monthsBack < totalMonthsToGoBack; monthsBack++) {
      String month = today
        .minus(monthsBack, ChronoUnit.MONTHS)
        .format(DateTimeFormatter.ofPattern("yyyy-MM"));

      JSONObject monthSummary = requestData(
        filePrefix + month + FileExtension.JSON_FILE.getExtension()
      );

      if (monthSummary != null) {
        monthSummaries.put(month, monthSummary);
      }
    }
    return monthSummaries;
  }

  private Map<String, JSONObject> getYearSummaries(String yearFilePrefix)
    throws UnsupportedEncodingException, IOException, ParseException {
    Map<String, JSONObject> yearSummaries = new HashMap<>();

    ZonedDateTime today = TimeUtil.getCurrentNYTime(clock);

    for (long yearsBack = 0; yearsBack < 4; yearsBack++) {
      String year = today
        .minus(yearsBack, ChronoUnit.YEARS)
        .format(DateTimeFormatter.ofPattern("yyyy"));

      JSONObject yearSummary = requestData(
        yearFilePrefix + year + FileExtension.JSON_FILE.getExtension()
      );

      if (yearSummary != null) {
        yearSummaries.put(year, yearSummary);
      }
    }
    return yearSummaries;
  }

  public Map<String, UsageSummary> getUserSummaries()
    throws UnsupportedEncodingException, IOException, ParseException {
    Map<String, JSONObject> months = getMonthSummaries(
      MONTH_USERS_USAGE_SUMMARY_FILE_PREFIX
    );
    Map<String, JSONObject> years = getYearSummaries(
      YEAR_USERS_USAGE_SUMMARY_FILE_PREFIX
    );
    Map<String, UsageSummary> userData = new HashMap<>();

    Set<String> users = new HashSet<>();

    for (Map.Entry<String, JSONObject> entry : years.entrySet()) {
      users.addAll(entry.getValue().keySet());
    }

    String yearKey = "year";
    String monthKey = "month";
    String dayKey = "day";
    for (String user : users) {
      userData.put(user, new UsageSummary());
    }
    for (Map.Entry<String, JSONObject> yearEntry : years.entrySet()) {
      String year = yearEntry.getKey();
      for (Object rawUserEntry : yearEntry.getValue().entrySet()) {
        Map.Entry<String, JSONObject> userEntry = (Map.Entry<String, JSONObject>) rawUserEntry;
        String user = userEntry.getKey();
        UsageSummary userMap = userData.get(user);
        if (userMap == null) {
          break;
        }
        Map<String, Map<String, Long>> yearMap = userMap.getYear();
        Map<String, Map<String, Long>> monthMap = userMap.getMonth();
        yearMap.put(year, (JSONObject) userEntry.getValue().get(yearKey));
        JSONObject monthJson = (JSONObject) userEntry.getValue().get(monthKey);
        for (Object rawMonthEntry : monthJson.entrySet()) {
          Map.Entry<String, JSONObject> monthEntry = (Map.Entry<String, JSONObject>) rawMonthEntry;
          String month = monthEntry.getKey();
          monthMap.put(month, monthEntry.getValue());
        }
      }
    }
    for (Map.Entry<String, JSONObject> monthEntry : months.entrySet()) {
      for (Object rawUserEntry : monthEntry.getValue().entrySet()) {
        Map.Entry<String, JSONObject> userEntry = (Map.Entry<String, JSONObject>) rawUserEntry;
        String user = userEntry.getKey();
        UsageSummary userMap = userData.get(user);
        if (userMap == null) {
          break;
        }
        Map<String, Map<String, Long>> dayMap = userMap.getDay();
        JSONObject dayJson = (JSONObject) userEntry.getValue().get(dayKey);
        for (Object rawDayEntry : dayJson.entrySet()) {
          Map.Entry<String, JSONObject> dayEntry = (Map.Entry<String, JSONObject>) rawDayEntry;
          String day = dayEntry.getKey();
          dayMap.put(day, dayEntry.getValue());
        }
      }
    }
    return userData;
  }

  public UsageSummary getResourceSummaries()
    throws IOException, ParseException {
    Map<String, JSONObject> months = getMonthSummaries(
      MONTH_RESOURCES_USAGE_SUMMARY_FILE_PREFIX
    );
    Map<String, JSONObject> years = getYearSummaries(
      YEAR_RESOURCES_USAGE_SUMMARY_FILE_PREFIX
    );
    UsageSummary resourceData = new UsageSummary();
    String yearKey = "year";
    String monthKey = "month";
    String dayKey = "day";

    for (Map.Entry<String, JSONObject> yearEntry : years.entrySet()) {
      String year = yearEntry.getKey();
      Map<String, Map<String, Long>> yearMap = resourceData.getYear();
      Map<String, Map<String, Long>> monthMap = resourceData.getMonth();
      yearMap.put(year, (JSONObject) yearEntry.getValue().get(yearKey));
      JSONObject monthJson = (JSONObject) yearEntry.getValue().get(monthKey);
      for (Object rawMonthEntry : monthJson.entrySet()) {
        Map.Entry<String, JSONObject> monthEntry = (Map.Entry<String, JSONObject>) rawMonthEntry;
        String month = monthEntry.getKey();
        monthMap.put(month, monthEntry.getValue());
      }
    }
    for (Map.Entry<String, JSONObject> monthEntry : months.entrySet()) {
      Map<String, Map<String, Long>> dayMap = resourceData.getDay();
      JSONObject dayJson = (JSONObject) monthEntry.getValue().get(dayKey);
      for (Object rawDayEntry : dayJson.entrySet()) {
        Map.Entry<String, JSONObject> dayEntry = (Map.Entry<String, JSONObject>) rawDayEntry;
        String day = dayEntry.getKey();
        dayMap.put(day, dayEntry.getValue());
      }
    }
    return resourceData;
  }

  /**
   * API to get the detail usage info for specific user
   * @param userId
   * @return user usage information of given user
   * @throws IOException
   * @throws ParseException
   */
  @GetMapping("/usage/users/{userId}")
  public ResponseEntity<UserUsage> userUsageGet(
    @PathVariable @NotNull Long userId
  )
    throws IOException, ParseException {
    if (userId != null) {
      Map<String, UsageSummary> userSummaries = getUserSummaries();

      Optional<User> user = userService.getUserById(userId);
      String email = user.map(User::getEmail).orElse(null);

      UsageSummary usageSummary = userSummaries.getOrDefault(
        email,
        new UsageSummary()
      );

      UserUsage userUsage = new UserUsage();
      userUsage.setUserFirstName(user.get().getFirstName());
      userUsage.setUserLastName(user.get().getLastName());
      userUsage.setUserEmail(email);
      userUsage.setLicenseType(
        Objects.nonNull(userMapper.userToUserDTO(user.get()).getLicenseType())
          ? userMapper.userToUserDTO(user.get()).getLicenseType().getName()
          : null
      );
      userUsage.setJobTitle(userMapper.userToUserDTO(user.get()).getJobTitle());
      userUsage.setCompany(
        userMapper.userToUserDTO(user.get()).getCompanyName()
      );
      userUsage.setSummary(usageSummary);
      return new ResponseEntity<>(userUsage, HttpStatus.OK);
    }

    return new ResponseEntity<>(new UserUsage(), HttpStatus.OK);
  }

  /**
   * API to get the usage summary of all users
   * @param companyId
   * @return a list of all users usage summary
   * @throws IOException
   * @throws ParseException
   */
  @GetMapping("/usage/summary/users")
  public ResponseEntity<List<UserOverviewUsage>> userOverviewUsageGet(
    @RequestParam(required = false) Long companyId
  )
    throws IOException, ParseException {
    Map<String, UsageSummary> usageSummaries = getUserSummaries();
    List<UserOverviewUsage> result = new ArrayList<>();
    Set<String> emailSet = usageSummaries.keySet();
    if (companyId != null) {
      emailSet =
        emailSet
          .stream()
          .filter(
            item -> {
              Optional<User> user = userService.getUserWithAuthoritiesByEmailIgnoreCase(
                item
              );
              if (user.isPresent()) {
                UserDTO userDTO = userMapper.userToUserDTO(user.get());
                if (userDTO.getCompany() != null) {
                  return Objects.equals(
                    userDTO.getCompany().getId(),
                    companyId
                  );
                }
              }
              return false;
            }
          )
          .collect(Collectors.toSet());
    }
    for (String email : emailSet) {
      UsageSummary usageSummary = usageSummaries.get(email);
      UserOverviewUsage userOverviewUsage = new UserOverviewUsage();
      userOverviewUsage.setUserEmail(email);
      Optional<User> user = userService.getUserWithAuthoritiesByEmailIgnoreCase(
        email
      );
      userOverviewUsage.setUserId(
        user.map(value -> value.getId().toString()).orElse(null)
      );

      Map<String, UserStats> dayUsage = getStats(usageSummary.getDay());
      Map<String, UserStats> monthUsage = getStats(usageSummary.getMonth());
      Map<String, UserStats> yearUsage = getStats(usageSummary.getYear());

      userOverviewUsage.setDayUsage(dayUsage);
      userOverviewUsage.setMonthUsage(monthUsage);
      userOverviewUsage.setYearUsage(yearUsage);

      result.add(userOverviewUsage);
    }

    return new ResponseEntity<>(result, HttpStatus.OK);
  }

  private Map<String, UserStats> getStats(
    Map<String, Map<String, Long>> usageObject
  ) {
    Map<String, UserStats> usage = new HashMap<>();
    for (Map.Entry<String, Map<String, Long>> entry : usageObject.entrySet()) {
      UserStats userStats = new UserStats();
      Map<String, Long> periodResourceUsage = entry.getValue();

      long totalUsageForPeriod = periodResourceUsage
        .values()
        .stream()
        .mapToLong(Long::longValue)
        .sum();

      long totalPublicUsageForPeriod = periodResourceUsage
        .entrySet()
        .stream()
        .filter(x -> !x.getKey().startsWith("/api/private/"))
        .mapToLong(x -> x.getValue())
        .sum();

      Map.Entry<String, Long> maxResourceEntry = periodResourceUsage
        .entrySet()
        .stream()
        .max(Map.Entry.comparingByValue())
        .orElse(new SimpleEntry<String, Long>("", 0L));

      Map.Entry<String, Long> maxPublicResourceEntry = periodResourceUsage
        .entrySet()
        .stream()
        .filter(x -> !x.getKey().startsWith("/api/private/"))
        .max(Map.Entry.comparingByValue())
        .orElse(new SimpleEntry<String, Long>("", 0L));

      String endpoint = maxResourceEntry.getKey();
      long maxUsage = maxResourceEntry.getValue();

      String publicEndpoint = maxPublicResourceEntry.getKey();
      long publicMaxUsage = maxPublicResourceEntry.getValue();

      userStats.setTotalUsage(totalUsageForPeriod);
      userStats.setTotalPublicUsage(totalPublicUsageForPeriod);
      userStats.setMostUsedEndpoint(endpoint);
      userStats.setMaxUsageProportion(
        (int) (1000 * ((float) maxUsage / totalUsageForPeriod)) / 10f
      );
      userStats.setMostUsedPublicEndpoint(publicEndpoint);
      userStats.setPublicMaxUsageProportion(
        (int) (1000 * ((float) publicMaxUsage / totalPublicUsageForPeriod)) /
        10f
      );
      usage.put(entry.getKey(), userStats);
    }
    return usage;
  }

  /**
   * API to return the usage summary of all resources
   * @return Usage summary of all resources
   * @throws IOException
   * @throws ParseException
   */
  @GetMapping("/usage/summary/resources")
  public ResponseEntity<UsageSummary> resourceUsageGet()
    throws IOException, ParseException {
    UsageSummary summary = getResourceSummaries();
    return new ResponseEntity<>(summary, HttpStatus.OK);
  }

  /**
   * API to get the usage of a specific resource
   * @param endpoint
   * @return usage of a specific endpoint
   * @throws UnsupportedEncodingException
   * @throws IOException
   * @throws ParseException
   */
  @GetMapping("/usage/resources")
  public ResponseEntity<UsageSummary> resourceDetailGet(
    @RequestParam String endpoint
  )
    throws UnsupportedEncodingException, IOException, ParseException {
    Map<String, UsageSummary> userSummaries = getUserSummaries();

    UsageSummary resourceDetail = new UsageSummary();
    Map<String, Map<String, Long>> yearResourceDetail = new HashMap<>();
    Map<String, Map<String, Long>> monthResourceDetail = new HashMap<>();
    Map<String, Map<String, Long>> dayResourceDetail = new HashMap<>();
    resourceDetail.setYear(yearResourceDetail);
    resourceDetail.setMonth(monthResourceDetail);
    resourceDetail.setDay(dayResourceDetail);

    for (Map.Entry<String, UsageSummary> userEntry : userSummaries.entrySet()) {
      String user = userEntry.getKey();
      UsageSummary userUsageSummary = userEntry.getValue();
      boolean containsEndpoint = false;
      for (Map<String, Long> endpointUsage : userUsageSummary
        .getYear()
        .values()) {
        if (endpointUsage.containsKey(endpoint)) {
          containsEndpoint = true;
          break;
        }
      }
      if (containsEndpoint) {
        addUserUsage(
          user,
          endpoint,
          yearResourceDetail,
          userUsageSummary.getYear()
        );
        addUserUsage(
          user,
          endpoint,
          monthResourceDetail,
          userUsageSummary.getMonth()
        );
        addUserUsage(
          user,
          endpoint,
          dayResourceDetail,
          userUsageSummary.getDay()
        );
      }
    }
    return new ResponseEntity<>(resourceDetail, HttpStatus.OK);
  }

  private void addUserUsage(
    String user,
    String endpoint,
    Map<String, Map<String, Long>> resourceDetail,
    Map<String, Map<String, Long>> summary
  ) {
    for (Map.Entry<String, Map<String, Long>> entry : summary.entrySet()) {
      String key = entry.getKey();
      Map<String, Long> map = entry.getValue();
      if (map.containsKey(endpoint)) {
        long usage = map.get(endpoint);
        if (!resourceDetail.containsKey(key)) {
          resourceDetail.put(key, new HashMap<>());
        }
        resourceDetail.get(key).put(user, usage);
      }
    }
  }
}
