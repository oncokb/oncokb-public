package org.mskcc.cbio.oncokb.web.rest;

import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.security.uuid.TokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;
import springfox.documentation.annotations.ApiIgnore;

@ApiIgnore
@Controller
public class ClientForwardController {
    @Autowired
    ApplicationProperties applicationProperties;
    @Autowired
    TokenProvider tokenProvider;
    @Autowired
    SpringTemplateEngine templateEngine;

    /**
     * Forwards any unmapped paths (except those containing a period) to the client {@code index.html}.
     *
     * @return forward to client {@code index.html}.
     */
    @GetMapping(value = "/index.html")
    public ResponseEntity<String> index() {
        Context context = new Context();
        context.setVariable("applicationProperties", applicationProperties);
        context.setVariable("publicToken", tokenProvider.getPubWebToken());

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.TEXT_HTML);

        ResponseEntity responseEntity = ResponseEntity.ok().headers(httpHeaders).body(templateEngine.process("index", context));
        return responseEntity;
    }

    @RequestMapping(value = "/${application.google-webmaster-verification}.html")
    public ResponseEntity<String> googleDomain() {
        Context context = new Context();
        context.setVariable("verification", applicationProperties.getGoogleWebmasterVerification());
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.TEXT_PLAIN);
        ResponseEntity responseEntity = ResponseEntity.ok().headers(httpHeaders).body(templateEngine.process("txt/googleWebmaster", context));
        return responseEntity;
    }

    /**
     * Forwards any unmapped paths (except those containing a period) to the client {@code index.html}.
     * @return forward to client {@code index.html}.
     */
    @GetMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/";
    }
}
