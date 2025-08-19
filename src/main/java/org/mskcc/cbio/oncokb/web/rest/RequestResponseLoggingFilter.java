package org.mskcc.cbio.oncokb.web.rest;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Order(1)
@Component
public class RequestResponseLoggingFilter extends OncePerRequestFilter {
  private static final Logger LOGGER = LoggerFactory.getLogger(
    RequestResponseLoggingFilter.class
  );
  private static final String REQUEST_ID_HEADER = "X-Request-ID";
  private static final String MDC_REQUEST_ID_KEY = "requestId";

  @Override
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain
  )
    throws ServletException, IOException {
    String requestId = request.getHeader(REQUEST_ID_HEADER);
    if (requestId == null || requestId.isEmpty()) {
      requestId = UUID.randomUUID().toString();
    }

    MDC.put(MDC_REQUEST_ID_KEY, requestId);

    try {
      String url = request.getRequestURI();
      String method = request.getMethod();
      LOGGER.info("Incoming Request: {} {}", method, url);
      filterChain.doFilter(request, response);
      int status = response.getStatus();
      LOGGER.info("Response status: {}", status);
    } catch (Exception e) {
      LOGGER.error("Unhandled exception", e);
      throw e;
    } finally {
      MDC.remove(MDC_REQUEST_ID_KEY);
    }
  }
}
