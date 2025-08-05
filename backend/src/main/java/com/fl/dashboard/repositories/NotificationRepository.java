package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    // Efficient paginated fetch with only necessary relations
    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId")
    Page<Notification> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user = :user")
    Page<Notification> findByUser(@Param("user") User user, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false")
    Page<Notification> findByUserAndIsReadFalse(@Param("user") User user, Pageable pageable);

    // Remove deep/nested fetches, use EntityGraph for basic relations
    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId")
    Page<Notification> findAllByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    void deleteByIsReadTrueAndCreatedAtBefore(LocalDateTime cutoffTime);

    boolean existsByProjetoIdAndUserIdAndType(Long projetoId, Long userId, String type);

    boolean existsByTarefaIdAndUserIdAndType(Long tarefaId, Long userId, String type);

}