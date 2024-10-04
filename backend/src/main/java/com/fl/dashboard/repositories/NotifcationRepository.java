package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotifcationRepository extends JpaRepository<Notification, Long> {
}
