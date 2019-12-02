package org.mskcc.cbio.oncokb.config.application;

public class MasterSlaveRedisCache {
    private String masterAddress;
    private String slaveAddress;

    public String getMasterAddress() {
        return masterAddress;
    }

    public void setMasterAddress(String masterAddress) {
        this.masterAddress = masterAddress;
    }

    public String getSlaveAddress() {
        return slaveAddress;
    }

    public void setSlaveAddress(String slaveAddress) {
        this.slaveAddress = slaveAddress;
    }
}
