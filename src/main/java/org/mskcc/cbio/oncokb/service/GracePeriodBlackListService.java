package org.mskcc.cbio.oncokb.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.util.StringUtil;
import org.springframework.stereotype.Service;

/**
 * Service for identifying registrations that should not receive a temporary grace period.
 */
@Service
public class GracePeriodBlackListService {

    // Temporary hardcoded list. Move to config or database when policy stabilizes.
    private static final Set<String> BLACKLISTED_DOMAINS;

    static {
        Set<String> domains = new HashSet<>();
        domains.add("gmail.com");
        domains.add("googlemail.com");
        domains.add("yahoo.com");
        domains.add("hotmail.com");
        domains.add("outlook.com");
        domains.add("live.com");
        domains.add("aol.com");
        domains.add("icloud.com");
        domains.add("msn.com");
        domains.add("protonmail.com");
        domains.add("qq.com");
        domains.add("163.com");
        domains.add("126.com");
        domains.add("sina.com");
        domains.add("alibaba.com");
        domains.add("him6.com");
        BLACKLISTED_DOMAINS = Collections.unmodifiableSet(domains);
    }

    public boolean shouldSkipGracePeriod(String email) {
        if (StringUtils.isBlank(email)) {
            return false;
        }

        String normalizedEmail = StringUtils.trim(email).toLowerCase(Locale.ENGLISH);
        String domain = StringUtil.getEmailDomain(normalizedEmail);
        return StringUtils.isNotBlank(domain) && BLACKLISTED_DOMAINS.contains(domain);
    }

    public Set<String> getBlacklistedDomains() {
        return BLACKLISTED_DOMAINS;
    }
}
