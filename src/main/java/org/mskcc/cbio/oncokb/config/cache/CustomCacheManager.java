package org.mskcc.cbio.oncokb.config.cache;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCache;

/**
 * This cache manager is used when Redis caching is disabled.
 */
public class CustomCacheManager implements CacheManager{

    private final ConcurrentMap<String, Cache> cacheMap = new ConcurrentHashMap<>();

    /**
	 * Get a collection of the cache names known by this manager.
	 * @return the names of all caches known by the cache manager
	 */
    @Override
	public Collection<String> getCacheNames(){
        return cacheMap.keySet();
    }


    /**
	 * Get the cache associated with the given name.
	 * <p>Note that the cache may be lazily created at runtime if the
	 * native provider supports it.
	 * @param name the cache identifier (must not be {@code null})
	 * @return the associated cache, or {@code null} if such a cache
	 * does not exist or could be not created
	 */
    @Override
    public Cache getCache(String name) {
        Cache cache = this.cacheMap.get(name);
        if (cache == null){
            cache = new ConcurrentMapCache(name, new ConcurrentHashMap<>(), true);
            cacheMap.put(name, cache);
        }else {
            // Currently, the cache is returned empty to avoid buildup.
            // In the future, we want to use in-memory cache with
            // a time to live on cache entries instead.
            cache.clear();
        }
        return cache;
    }

}
