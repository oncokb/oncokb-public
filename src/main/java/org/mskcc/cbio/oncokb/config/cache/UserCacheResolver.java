package org.mskcc.cbio.oncokb.config.cache;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

import java.util.ArrayList;
import java.util.Collection;

public class UserCacheResolver implements CacheResolver {
    public static String USERS_BY_LOGIN_CACHE = "usersByLogin";
    public static String USERS_BY_EMAIL_CACHE = "usersByEmail";


    private final ApplicationProperties applicationProperties;
    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public UserCacheResolver(CacheManager cacheManager, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        this.cacheManager = cacheManager;
        this.applicationProperties = applicationProperties;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findOneWithAuthoritiesByLogin") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(USERS_BY_LOGIN_CACHE)));
        } else if (context.getMethod().getName() == "findOneWithAuthoritiesByEmailIgnoreCase") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(USERS_BY_EMAIL_CACHE)));
        } else {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(context.getMethod().getName())));
        }

        return caches;
    }
}
