package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.User;
import com.fl.dashboard.entities.UserExtraHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserExtraHoursRepository extends JpaRepository<UserExtraHours, Long> {

    List<UserExtraHours> findByUser(User user);

    List<UserExtraHours> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    List<UserExtraHours> findByUserId(Long userId);

    List<UserExtraHours> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

}
