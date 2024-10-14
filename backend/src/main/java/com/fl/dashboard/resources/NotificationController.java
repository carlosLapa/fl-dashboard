package com.fl.dashboard.resources;

import com.fl.dashboard.dto.NotificationDTO;
import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
import com.fl.dashboard.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> findAll(Pageable pageable) {
        logger.info("Received request to fetch all notifications");
        Page<NotificationDTO> list = service.findAllPaged(pageable);
        logger.info("Returning {} notifications", list.getTotalElements());
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<NotificationDTO> findById(@PathVariable Long id) {
        NotificationDTO dto = service.findById(id);
        return ResponseEntity.ok().body(dto);
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> insert(@RequestBody NotificationInsertDTO dto) {
        logger.info("Received POST request to create notification: {}", dto);
        NotificationDTO notificationDTO = service.insert(dto);
        logger.info("Notification created: {}", notificationDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(notificationDTO.getId()).toUri();
        return ResponseEntity.created(uri).body(notificationDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<NotificationDTO> update(@PathVariable Long id, @RequestBody NotificationUpdateDTO dto) {
        NotificationDTO newDto = service.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("user/{userId}")
    public ResponseEntity<Page<NotificationDTO>> findByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationDTO> notifications = service.findByUser(userId, pageable);
        return ResponseEntity.ok().body(notifications);
    }
}

