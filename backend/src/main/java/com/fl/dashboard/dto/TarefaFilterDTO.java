package com.fl.dashboard.dto;

import com.fl.dashboard.enums.TarefaStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
public class TarefaFilterDTO {
    private String descricao;
    private TarefaStatus status;
    private Long projetoId;
    private String dateField;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date startDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date endDate;
}

