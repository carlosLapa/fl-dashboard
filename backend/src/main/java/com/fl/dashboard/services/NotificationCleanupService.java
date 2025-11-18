package com.fl.dashboard.services;

import com.fl.dashboard.repositories.NotificationRepository;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@EnableScheduling
public class NotificationCleanupService {

    private final NotificationRepository notificationRepository;

    public NotificationCleanupService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    @Scheduled(fixedRate = 120 * 60 * 60 * 1000) // Runs every 5 days
    public void cleanupReadNotifications() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        notificationRepository.deleteByIsReadTrueAndCreatedAtBefore(cutoffTime);
    }

}
