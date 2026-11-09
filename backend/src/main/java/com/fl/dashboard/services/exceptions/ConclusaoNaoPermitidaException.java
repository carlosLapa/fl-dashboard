package com.fl.dashboard.services.exceptions;

import java.io.Serial;

/**
 * A user without MOVE_CARD_TO_DONE tried to mark a tarefa as DONE. Mapped to 409 rather than 403
 * on purpose: the frontend's global axios interceptor turns any 403 on a /tarefas URL into an
 * empty "success" response, which would hide this refusal from the user.
 */
public class ConclusaoNaoPermitidaException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public ConclusaoNaoPermitidaException(String msg) {
        super(msg);
    }
}
