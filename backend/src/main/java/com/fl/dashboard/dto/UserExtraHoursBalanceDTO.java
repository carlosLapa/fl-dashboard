package com.fl.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserExtraHoursBalanceDTO {
    private Long userId;
    private String userName;
    private Double totalHours;
}
