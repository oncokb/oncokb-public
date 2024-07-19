package org.mskcc.cbio.oncokb.web.rest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mskcc.cbio.oncokb.config.Constants.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Map.Entry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.FileExtension;
import org.mskcc.cbio.oncokb.domain.enumeration.LicenseType;
import org.mskcc.cbio.oncokb.service.S3Service;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.service.dto.CompanyDTO;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.util.TimeUtil;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.testcontainers.shaded.org.apache.commons.io.IOUtils;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.http.AbortableInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

/**
 * Unit tests for the {@link UsageAnalysisController } REST controller.
 */
public class UsageAnalysisControllerIT {
  private final Gson gson = new Gson();

  @Mock
  private S3Service s3Service;

  @Mock
  private UserService userService;

  @Mock
  private UserMapper userMapper;

  @InjectMocks
  private UsageAnalysisController usageAnalysisController;

  private MockMvc restMockMvc;

  private final MockS3Data data = new MockS3Data(1);

  public UsageAnalysisControllerIT() throws Exception {}

  private void mockS3ObjectResponse(MockS3Data data) throws Exception {
    Mockito
      .when(userMapper.userToUserDTO(any()))
      .thenAnswer(
        i -> {
          User user = (User) i.getArguments()[0];
          Optional<UserDTO> userDto = data.userDtos
            .stream()
            .filter(x -> Objects.equals(x.getId(), user.getId()))
            .findFirst();
          return userDto.orElseThrow(Exception::new);
        }
      );

    Mockito
      .when(userService.getUserWithAuthoritiesByEmailIgnoreCase(any()))
      .thenAnswer(
        i -> {
          String email = (String) i.getArguments()[0];
          return data.users
            .stream()
            .filter(x -> x.getEmail().equalsIgnoreCase(email))
            .findFirst();
        }
      );

    Mockito
      .when(userService.getUserById(any()))
      .thenAnswer(
        i -> {
          long id = (long) i.getArguments()[0];
          return data.users.stream().filter(x -> x.getId() == id).findFirst();
        }
      );

    Mockito
      .when(s3Service.getObject(eq(Constants.ONCOKB_S3_BUCKET), any()))
      .thenAnswer(
        i -> {
          String filePath = (String) i.getArguments()[1];
          JsonElement element = data.files.get(filePath);
          String fileContents = gson.toJson(element);
          InputStream objectStream = IOUtils.toInputStream(
            fileContents,
            "UTF-8"
          );
          ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
            GetObjectResponse.builder().build(),
            AbortableInputStream.create(objectStream)
          );
          return Optional.of(stream);
        }
      );
  }

  @BeforeEach
  public void setup() throws Exception {
    usageAnalysisController = new UsageAnalysisController();
    MockitoAnnotations.initMocks(this);
    this.mockS3ObjectResponse(data);
    this.restMockMvc =
      MockMvcBuilders.standaloneSetup(usageAnalysisController).build();
  }

  @Test
  public void shouldGetUsageSummaryResources() throws Exception {
    String url = "/api/usage/summary/resources";
    String expected = gson.toJson(data.files.get(url));
    restMockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(content().json(expected, true));
  }

  @Test
  public void shouldGetUsageResources() throws Exception {
    String url =
      "/api/usage/resources?endpoint=" + data.sampleOncokbEndpoints[0];
    String expected = gson.toJson(data.files.get(url));
    restMockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      // strict checking enforces the same order on arrays
      // we need to use strict checks to make sure we are not missing
      // any data in our asserts
      // if you have issues with arrays make sure you have the correct order
      .andExpect(content().json(expected, true));
  }

  @Test
  public void shouldGetUsageSummaryUsers() throws Exception {
    String url = "/api/usage/summary/users";
    String expected = gson.toJson(data.files.get(url));
    restMockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(content().json(expected, true));
  }

  @Test
  public void shouldGetUsageSummaryUsersByCompanyId() throws Exception {
    String url =
      "/api/usage/summary/users?companyId=" +
      data.userDtos.get(0).getCompany().getId();
    String expected = gson.toJson(data.files.get(url));
    restMockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(content().json(expected, true));
  }

  @Test
  public void shouldGetUsageUsersById() throws Exception {
    String url = "/api/usage/users/" + data.users.get(0).getId();
    String expected = gson.toJson(data.files.get(url));
    restMockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(
        content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
      )
      .andExpect(content().json(expected, true));
  }

  private static class MockS3Data {

    private static class KeyValuePair<Key, Value> {
      public final Key key;
      public final Value value;

      public KeyValuePair(Key key, Value value) {
        this.key = key;
        this.value = value;
      }
    }

    private final String[] sampleOncokbEndpoints = {
      "/api/v1/annotate/mutations/byProteinChange",
      "/api/private/utils/numbers/main/",
      "/api/v1/annotate/structuralVariants",
      "/api/private/utils/numbers/levels/",
      "/api/v1/annotate/copyNumberAlterations",
      "/api/private/search/typeahead",
    };
    private final String[] fakeCompanies = { "FakeCo", "DemoLLC" };
    private final Random random;

    private final JsonObject files = new JsonObject();

    private final List<User> users = new ArrayList<>();
    private final List<UserDTO> userDtos = new ArrayList<>();

    public MockS3Data(int seed) throws Exception {
      this(seed, new String[] { "doej", "smithj" });
    }

    public MockS3Data(int seed, String[] userNames) throws Exception {
      random = new Random(seed);
      addUsers(userNames);
    }

    private String getNextOncokbEndpoint() {
      return sampleOncokbEndpoints[Math.abs(
          random.nextInt() % sampleOncokbEndpoints.length
        )];
    }

    /**
     * Get value from files JSON object based on the JSON path created by the
     * {@code keys}. If an object is missing in the JSON path then it's created.
     * @param keys The keys in JSON path
     * @return The resulting {@code KeyValuePair}
     */
    private KeyValuePair<String, JsonObject> fetchJsonObjectFromFilesObject(
      String... keys
    ) {
      JsonObject obj = files;
      for (int i = 0; i < keys.length - 1; i++) {
        String key = keys[i];
        if (!obj.has(key)) {
          obj.add(key, new JsonObject());
        }
        obj = (JsonObject) obj.get(key);
      }
      String lastKey = keys[keys.length - 1];
      return new KeyValuePair<>(lastKey, obj);
    }

    /**
     * Get value from files JSON object based on the JSON path created by the
     * {@code filePath}/[{@code index}]/{@code keys}.
     * If an object is missing in the JSON path then it's created.
     * @param filePath First key in the files object.
     * @param index Array index of the array the {@code filePath} parameter points to.
     * @param keys The remaining JSON path keys.
     * @return The resulting {@code KeyValuePair}
     */
    private KeyValuePair<String, JsonObject> fetchJsonObjectFromFilesObject(
      String filePath,
      int index,
      String... keys
    ) {
      JsonObject obj = files;
      if (!obj.has(filePath)) {
        obj.add(filePath, new JsonArray());
      }
      JsonArray arr = (JsonArray) obj.get(filePath);
      while (index >= arr.size()) {
        arr.add(new JsonObject());
      }
      obj = (JsonObject) arr.get(index);

      for (int i = 0; i < keys.length - 1; i++) {
        String key = keys[i];
        if (!obj.has(key)) {
          obj.add(key, new JsonObject());
        }
        obj = (JsonObject) obj.get(key);
      }
      String lastKey = keys[keys.length - 1];
      if (!obj.has(lastKey)) {
        obj.addProperty(lastKey, 0);
      }
      return new KeyValuePair<>(lastKey, obj);
    }

    /**
     * Adds the passed value to the value found in the files JSON object based on the JSON path created by the
     * keys. If an object is missing in the JSON path then it's created.
     * @param value Adds the specified value at the given JSON path.
     * @param keys The keys in JSON path.
     */
    private void safeAddNestedValueInFilesObject(int value, String... keys) {
      KeyValuePair<String, JsonObject> pair = fetchJsonObjectFromFilesObject(
        keys
      );
      String lastKey = pair.key;
      JsonObject obj = pair.value;
      if (!obj.has(lastKey)) {
        obj.addProperty(lastKey, 0);
      }
      JsonPrimitive primitive = (JsonPrimitive) obj.get(lastKey);
      int number = primitive.getAsInt();
      obj.addProperty(lastKey, number + value);
    }

    /**
     * Adds the passed value to the value found in the files JSON object based on the JSON path created by the
     * keys. If an object is missing in the JSON path then it's created.
     * @param value Adds the specified value at the given JSON path.
     * @param filePath First key in the files object.
     * @param index Array index of the array the {@code filePath} parameter points to.
     * @param keys The remaining JSON path keys.
     */
    private void safeAddNestedValueInFilesObject(
      int value,
      String filePath,
      int index,
      String... keys
    ) {
      KeyValuePair<String, JsonObject> pair = fetchJsonObjectFromFilesObject(
        filePath,
        index,
        keys
      );
      String lastKey = pair.key;
      JsonObject obj = pair.value;
      JsonPrimitive primitive = (JsonPrimitive) obj.get(lastKey);
      int number = primitive.getAsInt();
      obj.addProperty(lastKey, number + value);
    }

    /**
     * Set the passed value to the value found in the files JSON object based on the JSON path created by the
     * keys. If an object is missing in the JSON path then it's created.
     * @param value Sets the specified value at the given JSON path.
     * @param keys The keys in JSON path.
     */
    private void safeSetNestedValueInFilesObject(String value, String... keys) {
      KeyValuePair<String, JsonObject> pair = fetchJsonObjectFromFilesObject(
        keys
      );
      String lastKey = pair.key;
      JsonObject obj = pair.value;
      obj.addProperty(lastKey, value);
    }

    /**
     * Set the passed value to the value found in the files JSON object based on the JSON path created by the
     * keys. If an object is missing in the JSON path then it's created.
     * @param value The value that is going to be added to value located in the JSON path.
     * @param filePath First key in the files object.
     * @param index Array index of the array the {@code filePath} parameter points to.
     * @param keys The remaining JSON path keys.
     */
    private void safeSetNestedValueInFilesObject(
      String value,
      String filePath,
      int index,
      String... keys
    ) {
      KeyValuePair<String, JsonObject> pair = fetchJsonObjectFromFilesObject(
        filePath,
        index,
        keys
      );
      String lastKey = pair.key;
      JsonObject obj = pair.value;
      obj.addProperty(lastKey, value);
    }

    /**
     * Set the passed value to the value found in the files JSON object based on the JSON path created by the
     * keys. If an object is missing in the JSON path then it's created.
     * @param value The value that is going to be added to value located in the JSON path.
     * @param filePath First key in the files object.
     * @param index Array index of the array the {@code filePath} parameter points to.
     * @param keys The remaining JSON path keys.
     */
    private void safeSetNestedValueInFilesObject(
      float value,
      String filePath,
      int index,
      String... keys
    ) {
      KeyValuePair<String, JsonObject> pair = fetchJsonObjectFromFilesObject(
        filePath,
        index,
        keys
      );
      String lastKey = pair.key;
      JsonObject obj = pair.value;
      obj.addProperty(lastKey, value);
    }

    /**
     * Set an empty object to the value found in the files JSON object based on the JSON path created by the
     * keys. If an object is missing in the JSON path then it's created.
     * @param value The value that is going to be added to value located in the JSON path.
     * @param filePath First key in the files object.
     * @param index Array index of the array the {@code filePath} parameter points to.
     * @param keys The remaining JSON path keys.
     */
    private void safeSetNestedEmptyObjectInFilesObject(String... keys) {
      KeyValuePair<String, JsonObject> pair = fetchJsonObjectFromFilesObject(
        keys
      );
      String lastKey = pair.key;
      JsonObject obj = pair.value;
      if (!obj.has(lastKey)) {
        obj.add(lastKey, new JsonObject());
      }
    }

    private void addUsers(String[] userNames) throws Exception {
      LocalDate today = TimeUtil.getCurrentNYTime().toLocalDate();
      int currentYear = today.getYear();
      int userId = -1;
      String usageResources = "/api/usage/resources";
      for (String userName : userNames) {
        int totalUsage = 0;
        userId++;
        // force ordering to consistent since we are doing strict checks on
        // asserts for json
        userName = userId + userName;
        HashMap<String, Integer> userResourceUsage = new HashMap<>();
        for (String oncokbEndpoint : sampleOncokbEndpoints) {
          userResourceUsage.put(oncokbEndpoint, 0);
        }

        int companyIndex = userId % fakeCompanies.length;
        String companyName = fakeCompanies[companyIndex];

        User user = createMockUser(userId, userName, companyName);
        users.add(user);

        CompanyDTO companyDTO = createMockCompany(companyIndex, companyName);

        UserDTO userDto = createMockUserDto(user, companyDTO);
        userDtos.add(userDto);

        String usageUserEndpoint = "/api/usage/users/" + user.getId();
        String[] userUsageSummaryEndpoints = {
          "/api/usage/summary/users",
          "/api/usage/summary/users?companyId=" + companyDTO.getId(),
        };

        for (int yearIndex = 0; yearIndex < 4; yearIndex++) {
          int year = currentYear - yearIndex;
          Boolean isThisYear = yearIndex == 0;

          DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern(
            "yyyy-MM-dd"
          );
          DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern(
            "yyyy-MM"
          );

          String yearKey = String.valueOf(year);

          for (int month = 1; month <= 12; month++) {
            YearMonth yearMonth = YearMonth.of(year, month);
            String monthKey = yearMonth.format(monthFormatter);
            LocalDate start = yearMonth.atDay(1).atStartOfDay().toLocalDate();
            LocalDate end = yearMonth
              .atEndOfMonth()
              .atStartOfDay()
              .toLocalDate();

            for (
              LocalDate date = start;
              !date.isAfter(end) && !date.isAfter(today);
              date = date.plusDays(1)
            ) {
              int j = 0;
              String dayKey = date.format(dayFormatter);
              while (random.nextInt() % 5 == 0 && j < 5) {
                j++;
                String oncokbEndpoint = getNextOncokbEndpoint();
                int value = random.nextInt(100);
                updateResourceYearFile(
                  value,
                  oncokbEndpoint,
                  yearKey,
                  monthKey
                );

                updateResourceSummaryExpectedResponse(
                  value,
                  isThisYear,
                  oncokbEndpoint,
                  monthKey
                );

                if (yearIndex == 0) {
                  safeAddNestedValueInFilesObject(
                    value,
                    usageUserEndpoint,
                    "summary",
                    "year",
                    oncokbEndpoint
                  );
                }

                updateResourceMonthFile(
                  value,
                  oncokbEndpoint,
                  monthKey,
                  dayKey
                );

                updateUserYearFile(
                  value,
                  user,
                  oncokbEndpoint,
                  yearKey,
                  monthKey
                );

                if (yearIndex == 0) {
                  safeAddNestedValueInFilesObject(
                    value,
                    usageResources + "?endpoint=" + oncokbEndpoint,
                    "year",
                    user.getEmail()
                  );
                  safeAddNestedValueInFilesObject(
                    value,
                    usageResources + "?endpoint=" + oncokbEndpoint,
                    "month",
                    monthKey,
                    user.getEmail()
                  );
                  safeSetNestedEmptyObjectInFilesObject(
                    usageResources + "?endpoint=" + oncokbEndpoint,
                    "day"
                  );
                }

                updateUserMonthFile(
                  value,
                  user,
                  oncokbEndpoint,
                  monthKey,
                  dayKey
                );

                boolean isAfterOrEqualToPast12Months = date.isAfter(
                  today.minusMonths(11).withDayOfMonth(1).minusDays(1)
                );
                boolean isBeforeOrEqualToToday = date.isBefore(
                  today.plusMonths(1).withDayOfMonth(1)
                );
                if (isAfterOrEqualToPast12Months && isBeforeOrEqualToToday) {
                  for (String usageSummaryEndpoint : userUsageSummaryEndpoints) {
                    safeAddNestedValueInFilesObject(
                      value,
                      usageSummaryEndpoint,
                      userId,
                      "dayUsage",
                      dayKey
                    );

                    safeAddNestedValueInFilesObject(
                      value,
                      usageSummaryEndpoint,
                      userId,
                      "monthUsage",
                      monthKey
                    );
                  }

                  safeAddNestedValueInFilesObject(
                    value,
                    usageUserEndpoint,
                    "summary",
                    "month",
                    monthKey,
                    oncokbEndpoint
                  );
                  safeAddNestedValueInFilesObject(
                    value,
                    usageUserEndpoint,
                    "summary",
                    "day",
                    dayKey,
                    oncokbEndpoint
                  );
                }

                if (yearIndex == 0) {
                  userResourceUsage.put(
                    oncokbEndpoint,
                    userResourceUsage.get(oncokbEndpoint) + value
                  );
                  for (String usageSummaryUrl : userUsageSummaryEndpoints) {
                    safeAddNestedValueInFilesObject(
                      value,
                      usageSummaryUrl,
                      userId,
                      "totalUsage"
                    );
                  }
                  totalUsage += value;
                }
              }
            }
          }
        }
        Entry<String, Integer> maxResourceEntry = userResourceUsage
          .entrySet()
          .stream()
          .max(Map.Entry.comparingByValue())
          .orElseThrow(Exception::new);
        Entry<String, Integer> maxNoPrivateResourceEntry = userResourceUsage
          .entrySet()
          .stream()
          .filter(x -> !x.getKey().startsWith("/api/private/"))
          .max(Map.Entry.comparingByValue())
          .orElseThrow(Exception::new);

        updateUserUsageExpectedResponse(
          user,
          totalUsage,
          userUsageSummaryEndpoints,
          maxResourceEntry,
          maxNoPrivateResourceEntry
        );

        addUserInformationToUserUsageExpectedResponse(
          user,
          userDto,
          usageUserEndpoint
        );
      }
    }

    private void updateUserUsageExpectedResponse(
      User user,
      int totalUsage,
      String[] userUsageSummaryEndpoints,
      Entry<String, Integer> maxResourceEntry,
      Entry<String, Integer> maxNoPrivateResourceEntry
    ) {
      int userId = user.getId().intValue();
      for (String usageSummaryUrl : userUsageSummaryEndpoints) {
        safeSetNestedValueInFilesObject(
          String.valueOf(user.getId()),
          usageSummaryUrl,
          userId,
          "userId"
        );
        safeSetNestedValueInFilesObject(
          user.getEmail(),
          usageSummaryUrl,
          userId,
          "userEmail"
        );
        safeSetNestedValueInFilesObject(
          maxResourceEntry.getKey(),
          usageSummaryUrl,
          userId,
          "endpoint"
        );
        safeSetNestedValueInFilesObject(
          maxNoPrivateResourceEntry.getKey(),
          usageSummaryUrl,
          userId,
          "noPrivateEndpoint"
        );
        safeSetNestedValueInFilesObject(
          (int) (1000 * ((float) maxResourceEntry.getValue() / totalUsage)) /
          10f,
          usageSummaryUrl,
          userId,
          "maxUsageProportion"
        );
        safeSetNestedValueInFilesObject(
          (int) (
            1000 * ((float) maxNoPrivateResourceEntry.getValue() / totalUsage)
          ) /
          10f,
          usageSummaryUrl,
          userId,
          "noPrivateMaxUsageProportion"
        );
      }
    }

    private void addUserInformationToUserUsageExpectedResponse(
      User user,
      UserDTO userDto,
      String usageUserEndpoint
    ) {
      safeSetNestedValueInFilesObject(
        user.getFirstName(),
        usageUserEndpoint,
        "userFirstName"
      );
      safeSetNestedValueInFilesObject(
        user.getLastName(),
        usageUserEndpoint,
        "userLastName"
      );
      safeSetNestedValueInFilesObject(
        user.getEmail(),
        usageUserEndpoint,
        "userEmail"
      );
      safeSetNestedValueInFilesObject(
        userDto.getLicenseType().getName(),
        usageUserEndpoint,
        "licenseType"
      );
      safeSetNestedValueInFilesObject(
        userDto.getJobTitle(),
        usageUserEndpoint,
        "jobTitle"
      );
      safeSetNestedValueInFilesObject(
        userDto.getCompanyName(),
        usageUserEndpoint,
        "company"
      );
    }

    private void updateResourceSummaryExpectedResponse(
      int value,
      Boolean isThisYear,
      String oncokbEndpoint,
      String monthKey
    ) {
      if (isThisYear) {
        String usageSummaryResources = "/api/usage/summary/resources";
        safeAddNestedValueInFilesObject(
          value,
          usageSummaryResources,
          "year",
          oncokbEndpoint
        );
        safeAddNestedValueInFilesObject(
          value,
          usageSummaryResources,
          "month",
          monthKey,
          oncokbEndpoint
        );

        safeSetNestedEmptyObjectInFilesObject(usageSummaryResources, "day");
      }
    }

    private void updateResourceYearFile(
      int value,
      String oncokbEndpoint,
      String yearKey,
      String monthKey
    ) {
      String resourceYearPath =
        YEAR_RESOURCES_USAGE_SUMMARY_FILE_PREFIX +
        yearKey +
        FileExtension.JSON_FILE.getExtension();

      safeAddNestedValueInFilesObject(
        value,
        resourceYearPath,
        "year",
        oncokbEndpoint
      );
      safeAddNestedValueInFilesObject(
        value,
        resourceYearPath,
        "month",
        monthKey,
        oncokbEndpoint
      );
    }

    private void updateUserYearFile(
      int value,
      User user,
      String oncokbEndpoint,
      String yearKey,
      String monthKey
    ) {
      String userYearPath =
        YEAR_USERS_USAGE_SUMMARY_FILE_PREFIX +
        yearKey +
        FileExtension.JSON_FILE.getExtension();

      safeAddNestedValueInFilesObject(
        value,
        userYearPath,
        user.getEmail(),
        "year",
        oncokbEndpoint
      );
      safeAddNestedValueInFilesObject(
        value,
        userYearPath,
        user.getEmail(),
        "month",
        monthKey,
        oncokbEndpoint
      );
    }

    private void updateResourceMonthFile(
      int value,
      String oncokbEndpoint,
      String monthKey,
      String dayKey
    ) {
      String resourceMonthPath =
        MONTH_RESOURCES_USAGE_SUMMARY_FILE_PREFIX +
        monthKey +
        FileExtension.JSON_FILE.getExtension();
      safeAddNestedValueInFilesObject(
        value,
        resourceMonthPath,
        "month",
        monthKey,
        oncokbEndpoint
      );
      safeAddNestedValueInFilesObject(
        value,
        resourceMonthPath,
        "day",
        dayKey,
        oncokbEndpoint
      );
    }

    private void updateUserMonthFile(
      int value,
      User user,
      String oncokbEndpoint,
      String monthKey,
      String dayKey
    ) {
      String userMonthPath =
        MONTH_USERS_USAGE_SUMMARY_FILE_PREFIX +
        monthKey +
        FileExtension.JSON_FILE.getExtension();

      safeAddNestedValueInFilesObject(
        value,
        userMonthPath,
        user.getEmail(),
        "month",
        oncokbEndpoint
      );
      safeAddNestedValueInFilesObject(
        value,
        userMonthPath,
        user.getEmail(),
        "day",
        dayKey,
        oncokbEndpoint
      );
    }

    private UserDTO createMockUserDto(User user, CompanyDTO companyDTO) {
      UserDTO userDto = new UserDTO();
      userDto.setId(user.getId());
      userDto.setFirstName(user.getFirstName());
      userDto.setLastName(user.getLastName());
      userDto.setEmail(user.getEmail());
      userDto.setJobTitle(user.getLastName() + " Job Title");
      userDto.setCompany(companyDTO);
      userDto.setCompanyName(companyDTO.getName());
      userDto.setLicenseType(LicenseType.ACADEMIC);
      return userDto;
    }

    private CompanyDTO createMockCompany(int companyId, String companyName) {
      CompanyDTO companyDTO = new CompanyDTO();
      companyDTO.setName(companyName);
      companyDTO.setId((long) companyId);
      companyDTO.setLicenseType(LicenseType.ACADEMIC);
      return companyDTO;
    }

    private User createMockUser(
      int userId,
      String userName,
      String companyName
    ) {
      User user = new User();
      user.setId((long) userId);
      user.setEmail(userName + "@" + companyName + ".com");
      user.setFirstName(String.valueOf(userName.charAt(userName.length() - 1)));
      user.setLastName(userName.substring(0, userName.length() - 1));
      return user;
    }
  }
}
