package com.fl.dashboard.repositories;

import com.fl.dashboard.dto.UserExtraHoursBalanceDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.entities.UserExtraHours;
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

    List<UserExtraHours> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(e.hours), 0.0) FROM UserExtraHours e WHERE e.user.id = :userId")
    Double sumHoursByUserId(@Param("userId") Long userId);

    @Query("SELECT new com.fl.dashboard.dto.UserExtraHoursBalanceDTO(e.user.id, e.user.name, SUM(e.hours)) " +
            "FROM UserExtraHours e GROUP BY e.user.id, e.user.name")
    List<UserExtraHoursBalanceDTO> findAllUserBalances();

}
