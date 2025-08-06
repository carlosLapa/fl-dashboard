package com.fl.dashboard.dto;

import lombok.Data;

@Data
public class UserExtraHoursSummaryDTO {
    private Long userId;
    private String period;
    private Double totalHours;
}