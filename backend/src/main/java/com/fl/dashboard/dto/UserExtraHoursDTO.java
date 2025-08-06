package com.fl.dashboard.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserExtraHoursDTO {
    private Long id;
    private Long userId;
    private LocalDate date;
    private Double hours;
    private String comment;
}
