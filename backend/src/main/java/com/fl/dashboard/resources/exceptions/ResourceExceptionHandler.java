package com.fl.dashboard.resources.exceptions;

import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;

@ControllerAdvice
public class ResourceExceptionHandler {

    // Para saber o tipo de exceção que vai intercetar
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<CustomError> entityNotFound(ResourceNotFoundException e, HttpServletRequest httpServletRequest) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        CustomError err = new CustomError(Instant.now(), status.value(), e.getMessage(), httpServletRequest.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }

}
