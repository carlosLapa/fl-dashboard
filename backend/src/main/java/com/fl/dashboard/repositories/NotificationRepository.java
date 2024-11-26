package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT DISTINCT n FROM Notification n " +
            "LEFT JOIN FETCH n.user u " +
            "LEFT JOIN FETCH n.tarefa t " +
            "LEFT JOIN FETCH n.projeto p " +
            "LEFT JOIN FETCH t.users tu " +
            "LEFT JOIN FETCH p.users pu " +
            "WHERE n.user.id = :userId")
    List<Notification> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT n FROM Notification n " +
            "LEFT JOIN FETCH n.user u " +
            "LEFT JOIN FETCH n.tarefa t " +
            "LEFT JOIN FETCH n.projeto p " +
            "LEFT JOIN FETCH t.users tu " +
            "LEFT JOIN FETCH p.users pu " +
            "WHERE n.user = :user")
    Page<Notification> findByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT DISTINCT n FROM Notification n " +
            "LEFT JOIN FETCH n.user u " +
            "LEFT JOIN FETCH n.tarefa t " +
            "LEFT JOIN FETCH n.projeto p " +
            "LEFT JOIN FETCH t.users tu " +
            "LEFT JOIN FETCH p.users pu " +
            "WHERE n.user = :user AND n.isRead = false")
    Page<Notification> findByUserAndIsReadFalse(@Param("user") User user, Pageable pageable);

    @Query("SELECT DISTINCT n FROM Notification n " +
            "LEFT JOIN FETCH n.user u " +
            "LEFT JOIN FETCH u.projetos " +
            "LEFT JOIN FETCH n.tarefa t " +
            "LEFT JOIN FETCH t.users " +
            "LEFT JOIN FETCH n.projeto p " +
            "LEFT JOIN FETCH p.users " +
            "WHERE n.user.id = :userId")
    List<Notification> findAllByUserIdWithDetails(@Param("userId") Long userId);

    void deleteByIsReadTrueAndCreatedAtBefore(LocalDateTime cutoffTime);

}
