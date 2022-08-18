package org.mskcc.cbio.oncokb.web.rest;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.google.gson.Gson;

import org.mskcc.cbio.oncokb.domain.User;
import org.mskcc.cbio.oncokb.domain.enumeration.FileExtension;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.mskcc.cbio.oncokb.service.mapper.UserMapper;
import org.mskcc.cbio.oncokb.util.TimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.mskcc.cbio.oncokb.service.S3Service;
import org.mskcc.cbio.oncokb.service.UserService;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageSummary;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserOverviewUsage;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UserUsage;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static org.mskcc.cbio.oncokb.config.Constants.*;

@Controller
@RequestMapping("/api")
public class UsageAnalysisController {
    @Autowired
    private S3Service s3Service;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    private JSONObject requestData(String file)
            throws UnsupportedEncodingException, IOException, ParseException {
        Optional<S3Object> s3object = s3Service.getObject("oncokb", file);
        if (s3object.isPresent()){
            S3ObjectInputStream inputStream = s3object.get().getObjectContent();
            JSONParser jsonParser = new JSONParser();
            return (JSONObject) jsonParser.parse(new InputStreamReader(inputStream, "UTF-8"));
        }
        return null;
    }

    /**
     * API to get the detail usage info for specific user
     * @param userId
     * @return user usage infomation of given user
     * @throws IOException
     * @throws ParseException
     */
    @GetMapping("/usage/users/{userId}")
    public ResponseEntity<UserUsage> userUsageGet(@PathVariable String userId)
        throws IOException, ParseException {

        HttpStatus status = HttpStatus.OK;

        if (userId != null) {
            int year = TimeUtil.getCurrentNYTime().getYear();
            JSONObject yearSummary = requestData(YEAR_USERS_USAGE_SUMMARY_FILE_PREFIX + year + FileExtension.JSON_FILE.getExtension());
            List<JSONObject> monthSummaries = new LinkedList<>();
            int monthsBack = 0;
            JSONObject monthSummary;
            do {
                String month = TimeUtil.getCurrentNYTime().minus(monthsBack, ChronoUnit.MONTHS).format(DateTimeFormatter.ofPattern("yyyy-MM"));
                monthSummary = requestData(MONTH_USERS_USAGE_SUMMARY_FILE_PREFIX + month + FileExtension.JSON_FILE.getExtension());
                if (monthSummary != null) {
                    monthSummaries.add(monthSummary);
                }
                monthsBack++;
            } while (monthsBack < 12);

            Long id = Long.parseLong(userId);
            Optional<User> user = userService.getUserById(id);
            String email = user.map(User::getEmail).orElse(null);

            if (yearSummary != null){
                UsageSummary usageSummary = new UsageSummary();
                if (yearSummary.containsKey(email)) {
                    JSONObject yearUsageObject = (JSONObject) yearSummary.get(email);
                    Gson gson = new Gson();
                    usageSummary = gson.fromJson(yearUsageObject.toString(), UsageSummary.class);
                    Map<String, JSONObject> dayUsage = new HashMap<>();
                    if (!monthSummaries.isEmpty()) {
                        for (JSONObject month : monthSummaries) {
                            if (month.containsKey(email)) {
                                JSONObject monthUsageObject = (JSONObject) month.get(email);
                                JSONObject dayUsageObject = (JSONObject) monthUsageObject.get("day");
                                dayUsageObject.forEach((key, value) -> dayUsage.put((String) key, (JSONObject) value));
                            }
                        }
                        usageSummary.setDay(dayUsage);
                    }
                }

                UserUsage userUsage = new UserUsage();
                userUsage.setUserFirstName(user.get().getFirstName());
                userUsage.setUserLastName(user.get().getLastName());
                userUsage.setUserEmail(email);
                userUsage.setLicenseType(Objects.nonNull(userMapper.userToUserDTO(user.get()).getLicenseType()) ? userMapper.userToUserDTO(user.get()).getLicenseType().getName() : null);
                userUsage.setJobTitle(userMapper.userToUserDTO(user.get()).getJobTitle());
                userUsage.setCompany(userMapper.userToUserDTO(user.get()).getCompanyName());
                userUsage.setSummary(usageSummary);
                return new ResponseEntity<UserUsage>(userUsage, status);
            }
        }

        return new ResponseEntity<UserUsage>(new UserUsage(), status);
    }

    /**
     * API to get the usage summary of all users
     * @param companyId
     * @return a list of all users usage summary
     * @throws IOException
     * @throws ParseException
     */
    @GetMapping("/usage/summary/users")
    public ResponseEntity<List<UserOverviewUsage>> userOverviewUsageGet(@RequestParam(required = false) Long companyId)
        throws IOException, ParseException {
        HttpStatus status = HttpStatus.OK;

        int year = TimeUtil.getCurrentNYTime().getYear();
        JSONObject jsonObject = requestData(YEAR_USERS_USAGE_SUMMARY_FILE_PREFIX + year + FileExtension.JSON_FILE.getExtension());

        List<UserOverviewUsage> result = new ArrayList<>();
        if (jsonObject != null) {
            Set<Object> emailSet = jsonObject.keySet();
            if (companyId != null) {
                emailSet = emailSet.stream().filter(item -> {
                    Optional<User> user = userService.getUserByEmailIgnoreCase((String) item);
                    if (user.isPresent()) {
                        UserDTO userDTO = userMapper.userToUserDTO(user.get());
                        if (userDTO.getCompany() != null) {
                            return Objects.equals(userDTO.getCompany().getId(), companyId);
                        }
                    }
                    return false;
                }).collect(Collectors.toSet());
            }
            for (Object item : emailSet) {
                String email = (String) item;
                JSONObject usageObject = (JSONObject) jsonObject.get(email);
                Gson gson = new Gson();
                UsageSummary usageSummary = gson.fromJson(usageObject.toString(), UsageSummary.class);
                UserOverviewUsage cur = new UserOverviewUsage();
                cur.setUserEmail(email);
                Optional<User> user = userService.getUserByEmailIgnoreCase(email);
                cur.setUserId(user.map(value -> value.getId().toString()).orElse(null));

                String endpoint = "";
                int maxUsage = 0;
                String noPrivateEndpoint = "";
                int noPrivateMaxUsage = 0;
                int totalUsage = 0;
                Map<String, Integer> summary = usageSummary.getYear();
                for (String resource : summary.keySet()) {
                    totalUsage += summary.get(resource);
                    if (summary.get(resource) > maxUsage) {
                        endpoint = resource;
                        maxUsage = summary.get(resource);
                    }
                    if (resource.indexOf("/private/") == -1) {
                        if (summary.get(resource) > noPrivateMaxUsage) {
                            noPrivateEndpoint = resource;
                            noPrivateMaxUsage = summary.get(resource);
                        }
                    }
                }
                cur.setTotalUsage(totalUsage);
                cur.setEndpoint(endpoint);
                cur.setMaxUsage(maxUsage);
                cur.setNoPrivateEndpoint(noPrivateEndpoint);
                cur.setNoPrivateMaxUsage(noPrivateMaxUsage);

                result.add(cur);
            }
        }

        return new ResponseEntity<List<UserOverviewUsage>>(result, status);

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
        HttpStatus status = HttpStatus.OK;

        int year = TimeUtil.getCurrentNYTime().getYear();
        JSONObject jsonObject = requestData(YEAR_RESOURCES_USAGE_SUMMARY_FILE_PREFIX + year + FileExtension.JSON_FILE.getExtension());

        Gson gson = new Gson();
        UsageSummary summary = new UsageSummary();
        if (jsonObject != null) {
            summary = gson.fromJson(jsonObject.toString(), UsageSummary.class);
        }
        return new ResponseEntity<UsageSummary>(summary, status);
    }

    /**
     * API to get the usage of a sepcific resource
     * @param endpoint
     * @return usage of a specific endpoint
     * @throws UnsupportedEncodingException
     * @throws IOException
     * @throws ParseException
     */
    @GetMapping("/usage/resources")
    public ResponseEntity<UsageSummary> resourceDetailGet(@RequestParam String endpoint)
            throws UnsupportedEncodingException, IOException, ParseException {
        HttpStatus status = HttpStatus.OK;

        int year = TimeUtil.getCurrentNYTime().getYear();
        JSONObject resourceSummary = requestData(YEAR_RESOURCES_USAGE_SUMMARY_FILE_PREFIX + year + FileExtension.JSON_FILE.getExtension());
        JSONObject userSummary = requestData(YEAR_USERS_USAGE_SUMMARY_FILE_PREFIX + year + FileExtension.JSON_FILE.getExtension());
        if (resourceSummary != null && userSummary != null ){
            Gson gson = new Gson();
            UsageSummary resourceUsageSummary = gson.fromJson(resourceSummary.toString(), UsageSummary.class);
            if (resourceUsageSummary.getYear().containsKey(endpoint)) {
                UsageSummary resourceDetail = new UsageSummary();
                Map<String, JSONObject> monthResourceDetail = new HashMap<>();
                userSummary.keySet().forEach(user ->
                {
                    UsageSummary userUsageSummary = gson.fromJson(userSummary.get(user.toString()).toString(), UsageSummary.class);
                    int yearUsage = 0;
                    for (String month : userUsageSummary.getMonth().keySet()){
                        if (userUsageSummary.getMonth().get(month).containsKey(endpoint)) {
                            int monthUsage = (int) Double.parseDouble(userUsageSummary.getMonth().get(month).get(endpoint).toString());
                            if (!monthResourceDetail.containsKey(month))
                                monthResourceDetail.put(month, new JSONObject());
                            monthResourceDetail.get(month).put(user, monthUsage);
                            yearUsage += monthUsage;
                        }
                    }
                    resourceDetail.getYear().put(user.toString(), yearUsage);
                });
                resourceDetail.setMonth(monthResourceDetail);
                return new ResponseEntity<UsageSummary>(resourceDetail, status);
            }
        }
        return new ResponseEntity<>(new UsageSummary(), status);
    }
}
