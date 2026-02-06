package org.mskcc.cbio.oncokb.config.interceptor;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.Constants;
import org.mskcc.cbio.oncokb.security.SecurityUtils;
import org.mskcc.cbio.oncokb.service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.Instant;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final String RATE_LIMIT_REMAINING_HEADER = "x-ratelimit-remaining";
    private static final String RATE_LIMIT_RESET_HEADER = "x-ratelimit-reset";

    private RateLimitService rateLimitService;

    public RateLimitInterceptor(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
        String rateLimitKey = resolveRateLimitKey(request);
        if (StringUtils.isEmpty(rateLimitKey)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "The request cannot be supported as no user or IP Address provided");
            return false;
        }

        Bucket addressBucket = rateLimitService.resolveBucket(rateLimitKey);
        ConsumptionProbe probe = addressBucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.addHeader(RATE_LIMIT_REMAINING_HEADER, String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            response.addHeader(RATE_LIMIT_RESET_HEADER, String.valueOf(Instant.now().plusNanos(probe.getNanosToWaitForRefill()).toEpochMilli()));
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
                String.format(
                    "You have exhausted your API Request Quota. Max allowed is %d requests per %s.",
                    rateLimitService.getConfiguredCapacity(),
                    formatRefillPeriod(rateLimitService.getConfiguredRefillPeriod())
                ));
            return false;
        }
    }

    private String resolveRateLimitKey(HttpServletRequest request) {
        return SecurityUtils.getCurrentUserLogin()
            .filter(StringUtils::isNotBlank)
            .filter(login -> !Constants.ANONYMOUS_USER.equalsIgnoreCase(login))
            .filter(login -> !"anonymousUser".equalsIgnoreCase(login))
            .map(login -> "user:" + login)
            .orElseGet(() -> {
                String address = request.getRemoteAddr();
                if (StringUtils.isBlank(address)) {
                    return null;
                }
                return "ip:" + address;
            });
    }

    private String formatRefillPeriod(java.time.Duration duration) {
        long seconds = duration.getSeconds();
        long minutes = duration.toMinutes();
        long hours = duration.toHours();

        if (hours > 0 && seconds % 3600 == 0) {
            return hours == 1 ? "1 hour" : hours + " hours";
        }
        if (minutes > 0 && seconds % 60 == 0) {
            return minutes == 1 ? "1 minute" : minutes + " minutes";
        }
        if (seconds > 0) {
            return seconds == 1 ? "1 second" : seconds + " seconds";
        }

        long millis = duration.toMillis();
        return millis == 1 ? "1 millisecond" : millis + " milliseconds";
    }
}
