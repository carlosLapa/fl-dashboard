package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.projections.UnreadNotificationCountProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    // Efficient paginated fetch with only necessary relations
    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.createdAt DESC")
    Page<Notification> findByUser(@Param("user") User user, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false ORDER BY n.createdAt DESC")
    Page<Notification> findByUserAndIsReadFalse(@Param("user") User user, Pageable pageable);

    // Remove deep/nested fetches, use EntityGraph for basic relations
    @EntityGraph(attributePaths = {"user", "tarefa", "projeto"})
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findAllByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    // One aggregate query for a whole page of users, instead of the frontend firing one
    // findByUserAndIsReadFalse-style request per row (e.g. one NotificationBadge per row in the
    // Colaboradores table).
    @Query("SELECT n.user.id AS userId, COUNT(n) AS unreadCount FROM Notification n " +
            "WHERE n.user.id IN :userIds AND n.isRead = false GROUP BY n.user.id")
    List<UnreadNotificationCountProjection> countUnreadByUserIds(@Param("userIds") List<Long> userIds);

    void deleteByIsReadTrueAndCreatedAtBefore(LocalDateTime cutoffTime);

    // Unread notifications had no expiry at all before this — they accumulated indefinitely.
    void deleteByIsReadFalseAndCreatedAtBefore(LocalDateTime cutoffTime);

    boolean existsByProjetoIdAndUserIdAndType(Long projetoId, Long userId, String type);

    boolean existsByTarefaIdAndUserIdAndType(Long tarefaId, Long userId, String type);

    // Scoped to the specific deadline value that was active when the notification was created,
    // so a postponed-then-re-approaching deadline is treated as a new warning instead of being
    // suppressed forever by existsByTarefaIdAndUserIdAndType.
    boolean existsByTarefaIdAndUserIdAndTypeAndNotifiedDeadline(
            Long tarefaId, Long userId, String type, Date notifiedDeadline);

    boolean existsByProjetoIdAndUserIdAndTypeAndNotifiedDeadline(
            Long projetoId, Long userId, String type, Date notifiedDeadline);

}