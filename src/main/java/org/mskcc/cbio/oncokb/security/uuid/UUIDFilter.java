package org.mskcc.cbio.oncokb.security.uuid;

import com.github.mkopylec.recaptcha.validation.RecaptchaValidator;
import com.github.mkopylec.recaptcha.validation.ValidationResult;
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

import static org.mskcc.cbio.oncokb.security.AuthoritiesConstants.PUBLIC_WEBSITE;

/**
 * Filters incoming requests and installs a Spring Security principal if a header corresponding to a valid user is
 * found.
 */
public class UUIDFilter extends GenericFilterBean {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String RECAPTCHA_HEADER = "reCAPTCHA";

    private TokenProvider tokenProvider;

    private RecaptchaValidator recaptchaValidator;

    public UUIDFilter(TokenProvider tokenProvider, RecaptchaValidator recaptchaValidator) {
        this.tokenProvider = tokenProvider;
        this.recaptchaValidator = recaptchaValidator;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
        throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        UUID uuid = resolveToken(httpServletRequest);
        if (uuid != null && this.tokenProvider.validateToken(uuid)) {
            Authentication authentication = this.tokenProvider.getAuthentication(uuid);
            boolean isPublicWebsite = authentication.getAuthorities().stream().filter(grantedAuthority -> grantedAuthority.getAuthority().equals(PUBLIC_WEBSITE)).findAny().isPresent();
            if (isPublicWebsite) {
                String reCAPTCHA = resolveRecaptchaToken(httpServletRequest);
                ValidationResult result = recaptchaValidator.validate(reCAPTCHA);
                if (result.isSuccess()) {
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } else {
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
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

    private String resolveRecaptchaToken(HttpServletRequest request) {
        String recaptchaToken = request.getHeader(RECAPTCHA_HEADER);
        if (StringUtils.hasText(recaptchaToken) && recaptchaToken.startsWith("Bearer ")) {
            try {
                return recaptchaToken.substring(7);
            } catch (Exception e) {
                logger.info("Invalid token.");
                return null;
            }
        }
        return null;
    }
}
