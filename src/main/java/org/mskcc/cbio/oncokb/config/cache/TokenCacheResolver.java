package org.mskcc.cbio.oncokb.config.cache;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.repository.TokenRepository;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

import java.util.ArrayList;
import java.util.Collection;

public class TokenCacheResolver implements CacheResolver {
    public static String TOKEN_BY_UUID_CACHE = "tokenByUuid";
    public static String TOKENS_BY_USER_CACHE = "tokensByUser";


    private final ApplicationProperties applicationProperties;
    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public TokenCacheResolver(CacheManager cacheManager, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        this.cacheManager = cacheManager;
        this.applicationProperties = applicationProperties;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findByToken") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(TOKEN_BY_UUID_CACHE)));
        } else if (context.getMethod().getName() == "findByUser") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(TOKENS_BY_USER_CACHE)));
        } else {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(context.getMethod().getName())));
        }

        return caches;
    }
}
