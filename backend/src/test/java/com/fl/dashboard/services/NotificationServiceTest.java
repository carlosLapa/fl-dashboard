package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationResponseDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
import com.fl.dashboard.dto.UserMinDTO;
import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.NotificationRepository;
import com.fl.dashboard.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;
    private NotificationResponseDTO notificationResponseDTO;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Test User");

        notification = new Notification();
        notification.setId(1L);
        notification.setType("TEST");
        notification.setContent("Test Content");
        notification.setIsRead(false);
        notification.setUser(user);

        notificationResponseDTO = new NotificationResponseDTO();
        notificationResponseDTO.setId(notification.getId());
        notificationResponseDTO.setType(notification.getType());
        notificationResponseDTO.setContent(notification.getContent());
        notificationResponseDTO.setIsRead(notification.getIsRead());
        notificationResponseDTO.setCreatedAt(notification.getCreatedAt());

        UserMinDTO userDto = new UserMinDTO();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        notificationResponseDTO.setUser(userDto);
    }

    @Test
    void findAllPaged() {
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(notificationRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findAllPaged(PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(user.getName(), result.getContent().get(0).getUser().getName());
    }

    @Test
    void findById() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        NotificationResponseDTO result = notificationService.findById(1L);

        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        assertEquals(user.getName(), result.getUser().getName());
    }

    @Test
    void insert() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(userRepository.findById(any())).thenReturn(Optional.of(user));

        NotificationInsertDTO insertDTO = new NotificationInsertDTO();
        insertDTO.setType("TEST");
        insertDTO.setContent("Test Content");
        insertDTO.setUserId(1L);

        NotificationResponseDTO result = notificationService.insert(insertDTO);

        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        assertEquals(user.getId(), result.getUser().getId());
    }

    @Test
    void update() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationUpdateDTO updateDTO = new NotificationUpdateDTO();
        updateDTO.setId(1L);
        updateDTO.setContent("Updated Content");

        NotificationResponseDTO result = notificationService.update(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Updated Content", result.getContent());
        assertEquals(user.getName(), result.getUser().getName());
    }

    @Test
    void findByUser() {
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUser(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findByUser(1L, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(user.getName(), result.getContent().get(0).getUser().getName());
    }

    // Delete and markAsRead tests remain the same
    @Test
    void delete() {
        doNothing().when(notificationRepository).deleteById(1L);
        assertDoesNotThrow(() -> notificationService.delete(1L));
        verify(notificationRepository, times(1)).deleteById(1L);
    }

    @Test
    void markAsRead() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.markAsRead(1L);

        assertTrue(notification.getIsRead());
        verify(notificationRepository, times(1)).save(notification);
    }
}

