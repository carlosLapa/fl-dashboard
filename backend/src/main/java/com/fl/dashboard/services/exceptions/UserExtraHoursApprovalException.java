package com.fl.dashboard.services.exceptions;

/**
 * Thrown when a non-admin tries to create, edit or delete an entry in a way
 * that conflicts with the Banco de Horas approval workflow (e.g. editing an
 * already-approved entry). Mapped to HTTP 409 by ResourceExceptionHandler.
 */
public class UserExtraHoursApprovalException extends RuntimeException {

    public UserExtraHoursApprovalException(String message) {
        super(message);
    }
}
