package com.fl.dashboard.resources;

import com.fl.dashboard.dto.UserExtraHoursBalanceDTO;
import com.fl.dashboard.dto.UserExtraHoursDTO;
import com.fl.dashboard.dto.UserExtraHoursSummaryDTO;
import com.fl.dashboard.services.UserExtraHoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-extra-hours")
public class UserExtraHoursResource {

    private final UserExtraHoursService service;

    public UserExtraHoursResource(UserExtraHoursService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#dto.userId).email")
    public ResponseEntity<UserExtraHoursDTO> save(@RequestBody UserExtraHoursDTO dto) {
        UserExtraHoursDTO saved = service.save(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#userId).email")
    public ResponseEntity<List<UserExtraHoursDTO>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.findByUser(userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or @userExtraHoursService.isOwner(#id, authentication.name)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/monthly-summary/{year}")
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#userId).email")
    public ResponseEntity<List<UserExtraHoursSummaryDTO>> getMonthlySummary(@PathVariable Long userId, @PathVariable int year) {
        return ResponseEntity.ok(service.getMonthlySummary(userId, year));
    }

    @GetMapping("/user/{userId}/weekly-summary/{year}")
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#userId).email")
    public ResponseEntity<List<UserExtraHoursSummaryDTO>> getWeeklySummary(@PathVariable Long userId, @PathVariable int year) {
        return ResponseEntity.ok(service.getWeeklySummary(userId, year));
    }

    @GetMapping("/user/{userId}/balance")
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#userId).email")
    public ResponseEntity<UserExtraHoursBalanceDTO> getBalance(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getBalance(userId));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('VIEW_REPORTS')")
    public ResponseEntity<List<UserExtraHoursBalanceDTO>> getAllUserBalances() {
        return ResponseEntity.ok(service.getAllUserBalances());
    }
}
