package com.fl.dashboard.dto;

import com.fl.dashboard.enums.UserExtraHoursStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserExtraHoursDTO {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate date;
    private Double hours;
    private String comment;
    private UserExtraHoursStatus status;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
}
