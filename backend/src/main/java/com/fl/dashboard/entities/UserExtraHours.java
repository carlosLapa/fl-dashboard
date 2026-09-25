package com.fl.dashboard.entities;

import com.fl.dashboard.enums.UserExtraHoursStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_user_extra_hours",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"}))
@Getter
@Setter
@NoArgsConstructor
public class UserExtraHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double hours; // positive for extra, negative for less

    private String comment;

    // Approval workflow: an ADMIN's own writes are auto-approved; everyone
    // else's (including MANAGER, who can still write on a colaborador's
    // behalf via VIEW_REPORTS) land as PENDING until an ADMIN reviews them.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserExtraHoursStatus status = UserExtraHoursStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    private String rejectionReason;
}
