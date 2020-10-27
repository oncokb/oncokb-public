package org.mskcc.cbio.oncokb.security.uuid;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.UUID;

/**
 * Filters incoming requests and installs a Spring Security principal if a header corresponding to a valid user is
 * found.
 */
public class UUIDFilter extends GenericFilterBean {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String RECAPTCHA_HEADER = "reCAPTCHA";

    private TokenProvider tokenProvider;

    public UUIDFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
        throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        UUID uuid = resolveToken(httpServletRequest);
        if (uuid != null && this.tokenProvider.validateToken(uuid)) {
            Authentication authentication = this.tokenProvider.getAuthentication(uuid);
            SecurityContextHolder.getContext().setAuthentication(authentication);
//            this.tokenProvider.addAccessRecord(uuid, servletRequest.getRemoteAddr());
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

    private UUID resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            try {
                return UUID.fromString(bearerToken.substring(7));
            } catch (Exception e) {
                logger.info("Invalid token.");
                return null;
            }
        }
        return null;
    }
}
