package org.mskcc.cbio.oncokb.config.application;

/**
 * Created by Hongxin Zhang on 12/2/19.
 */
public class RedisProperties {
    String type;
    String password;
    MasterSlaveRedisCache masterSlaveCache;
    SingleRedisCache singleCache;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public MasterSlaveRedisCache getMasterSlaveCache() {
        return masterSlaveCache;
    }

    public void setMasterSlaveCache(MasterSlaveRedisCache masterSlaveCache) {
        this.masterSlaveCache = masterSlaveCache;
    }

    public SingleRedisCache getSingleCache() {
        return singleCache;
    }

    public void setSingleCache(SingleRedisCache singleCache) {
        this.singleCache = singleCache;
    }
}
