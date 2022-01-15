package org.mskcc.cbio.oncokb.web.rest.errors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class DatabaseReadOnlyAdvisor extends ResponseEntityExceptionHandler {
    
    @ExceptionHandler({DatabaseReadOnlyException.class})
    public ResponseEntity<String> handleDatabaseReadOnlyException(DatabaseReadOnlyException ex, WebRequest request) {
        return new ResponseEntity<>(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
