package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

import org.json.simple.JSONObject;

import java.util.Map;
import java.util.HashMap;

/**
 * Created by Yifu Yao on 2020-10-28
 */

public class UsageSummary {
    private Map<String, JSONObject> month = new HashMap<String, JSONObject>();
    private Map<String, Integer> year = new HashMap<String, Integer>();

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
