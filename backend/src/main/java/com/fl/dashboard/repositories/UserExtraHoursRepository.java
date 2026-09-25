package com.fl.dashboard.repositories;

import com.fl.dashboard.dto.UserExtraHoursBalanceDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.entities.UserExtraHours;
import com.fl.dashboard.enums.UserExtraHoursStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserExtraHoursRepository extends JpaRepository<UserExtraHours, Long> {

    List<UserExtraHours> findByUser(User user);

    List<UserExtraHours> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    List<UserExtraHours> findByUserId(Long userId);

    // Deliberately status-agnostic: used for the "one entry per user/date"
    // duplicate check on create, where any existing status still counts.
    List<UserExtraHours> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    // Status-scoped variant for monthly/weekly summaries, which must only
    // total APPROVED entries (see [[project_banco_horas_and_jwt_principal_bug]]
    // for why "current user" resolution here trusts the JWT email claim).
    List<UserExtraHours> findByUserIdAndDateBetweenAndStatus(
            Long userId, LocalDate start, LocalDate end, UserExtraHoursStatus status);

    List<UserExtraHours> findByStatusOrderByDateAsc(UserExtraHoursStatus status);

    @Query("SELECT COALESCE(SUM(e.hours), 0.0) FROM UserExtraHours e WHERE e.user.id = :userId AND e.status = :status")
    Double sumHoursByUserId(@Param("userId") Long userId, @Param("status") UserExtraHoursStatus status);

    @Query("SELECT new com.fl.dashboard.dto.UserExtraHoursBalanceDTO(e.user.id, e.user.name, SUM(e.hours)) " +
            "FROM UserExtraHours e WHERE e.status = :status GROUP BY e.user.id, e.user.name")
    List<UserExtraHoursBalanceDTO> findAllUserBalances(@Param("status") UserExtraHoursStatus status);

}
