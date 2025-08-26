package com.fl.dashboard.services.exceptions;

public class DeadlineValidationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public DeadlineValidationException(String msg) {
        super(msg);
    }

}
