package com.fl.dashboard.services.exceptions;

public class OptimisticLockConflictException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public OptimisticLockConflictException(String msg) {
        super(msg);
    }

}
