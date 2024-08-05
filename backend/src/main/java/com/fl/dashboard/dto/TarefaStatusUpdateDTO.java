package com.fl.dashboard.dto;

import com.fl.dashboard.enums.TarefaStatus;

public class TarefaStatusUpdateDTO {
    private TarefaStatus status;

    // Getter and setter
    public TarefaStatus getStatus() {
        return status;
    }

    public void setStatus(TarefaStatus status) {
        this.status = status;
    }
}
