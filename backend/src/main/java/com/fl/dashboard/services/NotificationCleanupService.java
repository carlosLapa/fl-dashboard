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

    // fixedRate counts from application startup, not wall-clock time — with this app restarting
    // multiple times a day (deploys, OOM auto-restarts), a 5-day fixedRate effectively never
    // reached its threshold in production. cron runs against the clock regardless of restarts.
    @Transactional
    @Scheduled(cron = "0 0 3 * * *") // Runs daily at 3am
    public void cleanupOldNotifications() {
        notificationRepository.deleteByIsReadTrueAndCreatedAtBefore(LocalDateTime.now().minusDays(3));
        // Unread notifications previously had no expiry at all and accumulated indefinitely.
        notificationRepository.deleteByIsReadFalseAndCreatedAtBefore(LocalDateTime.now().minusDays(30));
    }

}
