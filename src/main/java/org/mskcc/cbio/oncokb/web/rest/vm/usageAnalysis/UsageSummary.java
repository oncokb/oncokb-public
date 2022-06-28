package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

import org.json.simple.JSONObject;

import java.util.Map;
import java.util.HashMap;

/**
 * Created by Yifu Yao on 2020-10-28
 */

public class UsageSummary {
    private Map<String, JSONObject> day = new HashMap<>();
    private Map<String, JSONObject> month = new HashMap<>();
    private Map<String, Integer> year = new HashMap<>();

    public Map<String, JSONObject> getDay() {
        return day;
    }

    public void setDay(Map<String, JSONObject> day) {
        this.day = day;
    }

    public Map<String, JSONObject> getMonth() {
        return month;
    }

    public void setMonth(Map<String, JSONObject> month) {
        this.month = month;
    }

    public Map<String, Integer> getYear() {
        return year;
    }

    public void setYear(Map<String, Integer> year) {
        this.year = year;
    }


}
