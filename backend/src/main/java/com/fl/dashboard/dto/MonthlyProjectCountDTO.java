package com.fl.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyProjectCountDTO {

    /** e.g. "2026-01" */
    private String yearMonth;
    private int activeProjects;
}
