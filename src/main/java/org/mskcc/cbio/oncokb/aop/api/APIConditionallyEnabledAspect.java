package org.mskcc.cbio.oncokb.aop.api;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
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

    @Around("@annotation(APIConditionallyEnabled)")
    public void apiConditionallyEnabled(ProceedingJoinPoint jp, APIConditionallyEnabled APIConditionallyEnabled) throws Throwable {
        // The logic for the disabled endpoint will not run when a method has the disableEndpoint annotation
        // and in readonly mode.
        if(this.applicationProperties.getDbReadOnly() == true){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This endpoint is disabled");
        }else{
            jp.proceed();
        }
    }
}
