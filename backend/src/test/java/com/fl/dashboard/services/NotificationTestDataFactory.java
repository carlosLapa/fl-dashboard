package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.entities.User;

public class NotificationTestDataFactory {

    public static NotificationInsertDTO createNotificationInsertDTO() {
        NotificationInsertDTO dto = new NotificationInsertDTO();
        dto.setType("TEST");
        dto.setContent(NotificationServiceTestConstants.TEST_NOTIFICATION_CONTENT);
        dto.setUserId(NotificationServiceTestConstants.TEST_USER_ID);
        return dto;
    }

    public static User createTestUser() {
        User user = new User();
        user.setId(NotificationServiceTestConstants.TEST_USER_ID);
        user.setName(NotificationServiceTestConstants.TEST_USER_NAME);
        return user;
    }
}