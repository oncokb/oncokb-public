package org.mskcc.cbio.oncokb.aop.api;

import java.util.Optional;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;


@Aspect
@Component
public class APIConditionallyEnabledAspect {

    ApplicationProperties applicationProperties;

    public APIConditionallyEnabledAspect(ApplicationProperties applicationProperties){
        this.applicationProperties = applicationProperties;
    }

    @Before("@annotation(APIConditionallyEnabled)")
    public void apiConditionallyEnabled(JoinPoint jp, APIConditionallyEnabled APIConditionallyEnabled) throws Throwable {
        // The logic for the disabled endpoint will not run when a method has the disableEndpoint annotation
        // and in readonly mode.
        if(Optional.ofNullable(this.applicationProperties.getDbReadOnly()).orElse(false)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This endpoint is disabled");
        }
    }
}
