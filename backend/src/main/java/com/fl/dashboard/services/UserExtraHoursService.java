package com.fl.dashboard.services;

import com.fl.dashboard.dto.UserExtraHoursDTO;
import com.fl.dashboard.dto.UserExtraHoursSummaryDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.entities.UserExtraHours;
import com.fl.dashboard.repositories.UserExtraHoursRepository;
import com.fl.dashboard.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserExtraHoursService {

    @Autowired
    private UserExtraHoursRepository extraHoursRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public UserExtraHoursDTO save(UserExtraHoursDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (dto.getId() == null) {
            // Check for existing entry for this user and date
            List<UserExtraHours> existing = extraHoursRepository.findByUserIdAndDateBetween(
                    dto.getUserId(), dto.getDate(), dto.getDate());
            if (!existing.isEmpty()) {
                throw new IllegalStateException("Entry for this user and date already exists.");
            }
        }

        UserExtraHours entity = (dto.getId() != null)
                ? extraHoursRepository.findById(dto.getId()).orElse(new UserExtraHours())
                : new UserExtraHours();

        entity.setUser(user);
        entity.setDate(dto.getDate());
        entity.setHours(dto.getHours());
        entity.setComment(dto.getComment());

        entity = extraHoursRepository.save(entity);

        dto.setId(entity.getId());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursDTO> findByUser(Long userId) {
        return extraHoursRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        extraHoursRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursSummaryDTO> getMonthlySummary(Long userId, int year) {
        List<UserExtraHours> entries = extraHoursRepository.findByUserId(userId);
        Map<String, Double> monthTotals = new HashMap<>();

        for (UserExtraHours entry : entries) {
            if (entry.getDate().getYear() == year) {
                String month = entry.getDate().getYear() + "-" + String.format("%02d", entry.getDate().getMonthValue());
                monthTotals.put(month, monthTotals.getOrDefault(month, 0.0) + entry.getHours());
            }
        }

        List<UserExtraHoursSummaryDTO> result = new ArrayList<>();
        for (Map.Entry<String, Double> e : monthTotals.entrySet()) {
            UserExtraHoursSummaryDTO dto = new UserExtraHoursSummaryDTO();
            dto.setUserId(userId);
            dto.setPeriod(e.getKey());
            dto.setTotalHours(e.getValue());
            result.add(dto);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursSummaryDTO> getWeeklySummary(Long userId, int year) {
        List<UserExtraHours> entries = extraHoursRepository.findByUserId(userId);
        Map<String, Double> weekTotals = new HashMap<>();
        WeekFields weekFields = WeekFields.ISO;

        for (UserExtraHours entry : entries) {
            if (entry.getDate().getYear() == year) {
                int week = entry.getDate().get(weekFields.weekOfWeekBasedYear());
                String period = entry.getDate().getYear() + "-W" + String.format("%02d", week);
                weekTotals.put(period, weekTotals.getOrDefault(period, 0.0) + entry.getHours());
            }
        }

        List<UserExtraHoursSummaryDTO> result = new ArrayList<>();
        for (Map.Entry<String, Double> e : weekTotals.entrySet()) {
            UserExtraHoursSummaryDTO dto = new UserExtraHoursSummaryDTO();
            dto.setUserId(userId);
            dto.setPeriod(e.getKey());
            dto.setTotalHours(e.getValue());
            result.add(dto);
        }
        return result;
    }

    private UserExtraHoursDTO toDTO(UserExtraHours entity) {
        UserExtraHoursDTO dto = new UserExtraHoursDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setDate(entity.getDate());
        dto.setHours(entity.getHours());
        dto.setComment(entity.getComment());
        return dto;
    }
}