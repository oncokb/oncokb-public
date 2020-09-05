package org.mskcc.cbio.oncokb.config.cache;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.stereotype.Component;

/**
 * Created by Hongxin Zhang on 9/4/20.
 */
@Component
public class CacheNameResolver {

    ApplicationProperties applicationProperties;

    public CacheNameResolver(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getCacheName(String cacheKey) {
        return applicationProperties.getName() + "-" + cacheKey;
    }
}
