package org.mskcc.cbio.oncokb.config.interceptor;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.apache.commons.lang3.StringUtils;
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
        String address = request.getRemoteAddr();
        if (StringUtils.isEmpty(address)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "The request cannot be supported as no IP Address provided");
            return false;
        }

        Bucket addressBucket = rateLimitService.resolveBucket(address);
        ConsumptionProbe probe = addressBucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.addHeader(RATE_LIMIT_REMAINING_HEADER, String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            response.addHeader(RATE_LIMIT_RESET_HEADER, String.valueOf(Instant.now().plusNanos(probe.getNanosToWaitForRefill()).toEpochMilli()));
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
                "You have exhausted your API Request Quota");
            return false;
        }
    }
}
