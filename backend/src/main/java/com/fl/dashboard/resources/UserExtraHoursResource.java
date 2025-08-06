package com.fl.dashboard.resources;

import com.fl.dashboard.dto.UserExtraHoursDTO;
import com.fl.dashboard.dto.UserExtraHoursSummaryDTO;
import com.fl.dashboard.services.UserExtraHoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-extra-hours")
public class UserExtraHoursResource {

    @Autowired
    private UserExtraHoursService service;

    @PostMapping
    public ResponseEntity<UserExtraHoursDTO> save(@RequestBody UserExtraHoursDTO dto) {
        UserExtraHoursDTO saved = service.save(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserExtraHoursDTO>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.findByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/monthly-summary/{year}")
    public ResponseEntity<List<UserExtraHoursSummaryDTO>> getMonthlySummary(
            @PathVariable Long userId,
            @PathVariable int year) {
        return ResponseEntity.ok(service.getMonthlySummary(userId, year));
    }

    @GetMapping("/user/{userId}/weekly-summary/{year}")
    public ResponseEntity<List<UserExtraHoursSummaryDTO>> getWeeklySummary(
            @PathVariable Long userId,
            @PathVariable int year) {
        return ResponseEntity.ok(service.getWeeklySummary(userId, year));
    }
}
