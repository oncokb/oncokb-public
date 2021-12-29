package org.mskcc.cbio.oncokb.config.cache;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

import java.util.ArrayList;
import java.util.Collection;

public class CompanyCacheResolver implements CacheResolver {
    public static String COMPANIES_BY_ID_CACHE = "companiesById";
    public static String COMPANIES_BY_NAME_CACHE = "companiesByName";


    private final ApplicationProperties applicationProperties;
    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public CompanyCacheResolver(CacheManager cacheManager, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        this.cacheManager = cacheManager;
        this.applicationProperties = applicationProperties;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findById") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(COMPANIES_BY_ID_CACHE)));
        } else if (context.getMethod().getName() == "findOneByNameIgnoreCase") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(COMPANIES_BY_NAME_CACHE)));
        } else {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(context.getMethod().getName())));
        }

        return caches;
    }
}

