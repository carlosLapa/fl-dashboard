package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUser(User user, Pageable pageable);

    Page<Notification> findByUserAndIsReadFalse(User user, Pageable pageable);

    List<Notification> findByUserId(Long userId);

    List<Notification> findByProjetoId(Long projetoId);

    List<Notification> findByTarefaId(Long tarefaId);
}
