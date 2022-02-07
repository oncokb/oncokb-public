package org.mskcc.cbio.oncokb.aop.repository;

import java.util.Optional;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.web.rest.errors.DatabaseReadOnlyException;
import org.springframework.stereotype.Component;


@Aspect
@Component
public class DatabaseReadOnlyAspect {

    ApplicationProperties applicationProperties;

    public DatabaseReadOnlyAspect(ApplicationProperties applicationProperties){
        this.applicationProperties = applicationProperties;
    }

    // Repositories where we don't want to throw an exception
    @Pointcut("!execution(* org.mskcc.cbio.oncokb.repository.PersistenceAuditEventRepository.save(..))")
    private void excludedRepositorySaveOperation() {}

    @Pointcut("execution(* org.mskcc.cbio.oncokb.repository.*.save(..))")
    private void anyRepositorySaveOperation() {}

    @Before(value = "anyRepositorySaveOperation() && excludedRepositorySaveOperation()")
    public void databaseReadOnlyWithError(JoinPoint jp) throws Throwable {
        if(Optional.ofNullable(this.applicationProperties.getDbReadOnly()).orElse(false)){
            // When the save method is called, we throw an exception that will be 
            // handled by DatabaseReadOnlyAdvisor (ControllerAdvice).
            throw new DatabaseReadOnlyException();
        }
    }

    @Around(value = "anyRepositorySaveOperation() && !excludedRepositorySaveOperation()")
    public Object databaseReadOnly(ProceedingJoinPoint jp) throws Throwable {
        if(!Optional.ofNullable(this.applicationProperties.getDbReadOnly()).orElse(false)){
            // Execute the method if the db-read-only is false
            return jp.proceed();
        }
        // Skip the save method call when db-read-only is true
        return null;
    }
}
