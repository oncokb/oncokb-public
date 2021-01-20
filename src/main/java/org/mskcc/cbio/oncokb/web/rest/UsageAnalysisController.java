package org.mskcc.cbio.oncokb.web.rest;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.google.gson.Gson;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.mskcc.cbio.oncokb.service.S3Service;
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

@Controller
@RequestMapping("/api")
public class UsageAnalysisController {
    @Autowired
    private S3Service s3Service;

    final String USERS_USAGE_SUMMARY_FILE = "usage-analysis/userSummary.json";
    final String RESOURCES_USAGE_SUMMARY_FILE = "usage-analysis/resourceSummary.json";

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

    @GetMapping("/usage/users/{userId}")
    public ResponseEntity<UserUsage> userUsageGet(@PathVariable String userId)
        throws IOException, ParseException {
    
        HttpStatus status = HttpStatus.OK;

        JSONObject jsonObject = requestData(USERS_USAGE_SUMMARY_FILE);

        if (jsonObject.containsKey(userId)){
            JSONObject usageObject = (JSONObject)jsonObject.get(userId);
            Gson gson = new Gson();
            UserUsage userUsage = gson.fromJson(usageObject.toString(), UserUsage.class);
            return new ResponseEntity<UserUsage>(userUsage, status);
        }

        return new ResponseEntity<UserUsage>(new UserUsage(), status);
        
    }

    @GetMapping("/usage/overview")
    public ResponseEntity<List<UserOverviewUsage>> userOverviewUsageGet()
        throws IOException, ParseException {
        HttpStatus status = HttpStatus.OK;

        JSONObject jsonObject = requestData(USERS_USAGE_SUMMARY_FILE);
        
        List<UserOverviewUsage> result = new ArrayList<>();
        for (Object item: jsonObject.keySet()){
            String id = (String) item;
            JSONObject usageObject = (JSONObject)jsonObject.get(id);
            Gson gson = new Gson();
            UserUsage userUsage = gson.fromJson(usageObject.toString(), UserUsage.class); 
            UserOverviewUsage cur = new UserOverviewUsage();
            cur.setUserId(id);
            cur.setUserEmail(userUsage.getUserEmail());
            
            String endpoint = "";
            int maxUsage = 0;
            String noPrivateEndpoint = "";
            int noPrivateMaxUsage = 0;
            int totalUsage = 0;
            Map<String,Integer> summary = userUsage.getSummary().getYear();
            for (String resource: summary.keySet()){
                totalUsage += summary.get(resource);
                if (summary.get(resource) > maxUsage){
                    endpoint = resource;
                    maxUsage = summary.get(resource);
                }
                if (resource.indexOf("/private/") == -1){
                    if (summary.get(resource) > noPrivateMaxUsage){
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

        return new ResponseEntity<List<UserOverviewUsage>>(result, status);
        
    }

    @GetMapping("/usage/resource")
    public ResponseEntity<UsageSummary> resourceUsageGet()
        throws IOException, ParseException {
        HttpStatus status = HttpStatus.OK;

        JSONObject jsonObject = requestData(RESOURCES_USAGE_SUMMARY_FILE);

        Gson gson = new Gson();
        UsageSummary summary = gson.fromJson(jsonObject.toString(), UsageSummary.class);

        return new ResponseEntity<UsageSummary>(summary, status);
    }
}
