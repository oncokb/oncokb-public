package org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis;

public class ResourceModel {
    
    String method;
    String endpoint;
    
    public ResourceModel(String s){
        this.method =  s.split(" ")[0];
        this.endpoint = s.split(" ")[1].replaceAll("\\%20", "");
    }

    public String getMethod(){
        return method;
    }

    public String getEndpoint(){
        return endpoint;
    }
}
