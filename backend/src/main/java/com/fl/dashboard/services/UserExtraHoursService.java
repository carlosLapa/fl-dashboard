package com.fl.dashboard.services;

import com.fl.dashboard.dto.UserExtraHoursBalanceDTO;
import com.fl.dashboard.dto.UserExtraHoursDTO;
import com.fl.dashboard.dto.UserExtraHoursSummaryDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.entities.UserExtraHours;
import com.fl.dashboard.enums.RoleType;
import com.fl.dashboard.enums.UserExtraHoursStatus;
import com.fl.dashboard.repositories.UserExtraHoursRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.UserExtraHoursApprovalException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
public class UserExtraHoursService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final UserExtraHoursRepository extraHoursRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public UserExtraHoursService(UserExtraHoursRepository extraHoursRepository, UserRepository userRepository,
                                  NotificationService notificationService) {
        this.extraHoursRepository = extraHoursRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }


    @Transactional
    public UserExtraHoursDTO save(UserExtraHoursDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        boolean isNew = dto.getId() == null;
        UserExtraHours entity;
        if (isNew) {
            // Check for existing entry for this user and date, regardless of status:
            // the unique (user_id, date) constraint means a resubmission after a
            // rejection edits that same row rather than creating a new one.
            List<UserExtraHours> existing = extraHoursRepository.findByUserIdAndDateBetween(
                    dto.getUserId(), dto.getDate(), dto.getDate());
            if (!existing.isEmpty()) {
                throw new IllegalStateException("Entry for this user and date already exists.");
            }
            entity = new UserExtraHours();
        } else {
            entity = extraHoursRepository.findById(dto.getId())
                    .orElseThrow(() -> new NoSuchElementException("Entry not found"));
        }

        User actor = getCurrentAuthenticatedUser();
        boolean actorIsAdmin = isAdmin(actor);

        if (!isNew && entity.getStatus() == UserExtraHoursStatus.APPROVED && !actorIsAdmin) {
            throw new UserExtraHoursApprovalException(
                    "Não é possível editar um lançamento já aprovado. Peça a um administrador para o alterar.");
        }

        entity.setUser(user);
        entity.setDate(dto.getDate());
        entity.setHours(dto.getHours());
        entity.setComment(dto.getComment());

        if (actorIsAdmin) {
            entity.setStatus(UserExtraHoursStatus.APPROVED);
            entity.setReviewedBy(actor);
            entity.setReviewedAt(LocalDateTime.now());
            entity.setRejectionReason(null);
        } else {
            // A resubmission after rejection (or a first submission) always
            // goes back to PENDING for an ADMIN to review.
            entity.setStatus(UserExtraHoursStatus.PENDING);
            entity.setReviewedBy(null);
            entity.setReviewedAt(null);
            entity.setRejectionReason(null);
        }

        entity = extraHoursRepository.save(entity);

        if (!actorIsAdmin) {
            notifyAdminsOfPendingEntry(entity);
        }

        return toDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursDTO> findByUser(Long userId) {
        return extraHoursRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursDTO> findPending() {
        return extraHoursRepository.findByStatusOrderByDateAsc(UserExtraHoursStatus.PENDING).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public UserExtraHoursDTO approve(Long id) {
        UserExtraHours entity = extraHoursRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Entry not found"));

        User actor = getCurrentAuthenticatedUser();
        entity.setStatus(UserExtraHoursStatus.APPROVED);
        entity.setReviewedBy(actor);
        entity.setReviewedAt(LocalDateTime.now());
        entity.setRejectionReason(null);
        entity = extraHoursRepository.save(entity);

        notificationService.createGeneralNotification(entity.getUser(),
                "O seu lançamento de " + formatEntry(entity) + " foi aprovado.");

        return toDTO(entity);
    }

    @Transactional
    public UserExtraHoursDTO reject(Long id, String reason) {
        UserExtraHours entity = extraHoursRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Entry not found"));

        User actor = getCurrentAuthenticatedUser();
        entity.setStatus(UserExtraHoursStatus.REJECTED);
        entity.setReviewedBy(actor);
        entity.setReviewedAt(LocalDateTime.now());
        entity.setRejectionReason(reason);
        entity = extraHoursRepository.save(entity);

        String suffix = (reason != null && !reason.isBlank()) ? ": " + reason : ".";
        notificationService.createGeneralNotification(entity.getUser(),
                "O seu lançamento de " + formatEntry(entity) + " foi rejeitado" + suffix);

        return toDTO(entity);
    }

    @Transactional
    public void delete(Long id) {
        UserExtraHours entity = extraHoursRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Entry not found"));

        if (entity.getStatus() == UserExtraHoursStatus.APPROVED && !isAdmin(getCurrentAuthenticatedUser())) {
            throw new UserExtraHoursApprovalException(
                    "Não é possível excluir um lançamento já aprovado. Peça a um administrador.");
        }

        extraHoursRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public UserExtraHoursBalanceDTO getBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        Double total = extraHoursRepository.sumHoursByUserId(userId, UserExtraHoursStatus.APPROVED);
        return new UserExtraHoursBalanceDTO(userId, user.getName(), total);
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursBalanceDTO> getAllUserBalances() {
        return extraHoursRepository.findAllUserBalances(UserExtraHoursStatus.APPROVED).stream()
                .sorted(Comparator.comparing(UserExtraHoursBalanceDTO::getUserName))
                .toList();
    }

    @Transactional
    public boolean isOwner(Long id, String email) {
        return extraHoursRepository.findById(id)
                .map(entry -> entry.getUser().getEmail().equals(email))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<UserExtraHoursSummaryDTO> getMonthlySummary(Long userId, int year) {
        List<UserExtraHours> entries = extraHoursRepository.findByUserIdAndDateBetweenAndStatus(
                userId, LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31), UserExtraHoursStatus.APPROVED);
        Map<String, Double> monthTotals = new HashMap<>();

        for (UserExtraHours entry : entries) {
            String month = entry.getDate().getYear() + "-" + String.format("%02d", entry.getDate().getMonthValue());
            monthTotals.put(month, monthTotals.getOrDefault(month, 0.0) + entry.getHours());
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
        List<UserExtraHours> entries = extraHoursRepository.findByUserIdAndDateBetweenAndStatus(
                userId, LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31), UserExtraHoursStatus.APPROVED);
        Map<String, Double> weekTotals = new HashMap<>();
        WeekFields weekFields = WeekFields.ISO;

        for (UserExtraHours entry : entries) {
            int week = entry.getDate().get(weekFields.weekOfWeekBasedYear());
            String period = entry.getDate().getYear() + "-Semana" + String.format("%02d", week);
            weekTotals.put(period, weekTotals.getOrDefault(period, 0.0) + entry.getHours());
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

    private void notifyAdminsOfPendingEntry(UserExtraHours entity) {
        List<User> admins = userRepository.findByRoles_Name(RoleType.ADMIN);
        String content = entity.getUser().getName() + " lançou " + formatEntry(entity) + " — aguarda aprovação.";
        for (User admin : admins) {
            notificationService.createGeneralNotification(admin, content);
        }
    }

    private String formatEntry(UserExtraHours entity) {
        double hours = entity.getHours();
        String sign = hours > 0 ? "+" : "";
        return sign + hours + "h em " + entity.getDate().format(DATE_FORMAT);
    }

    // Trusts the JWT "email" claim rather than authentication.getName(), which
    // is unreliable for this OAuth2 password grant setup — see
    // ResourceServerConfig.jwtAuthenticationConverter() and the write-up in
    // both CLAUDE.md files under "Security Model" / "Permissions".
    private User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email;
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            email = jwtToken.getToken().getClaimAsString("email");
        } else {
            email = auth.getName();
        }
        return userRepository.findByEmail(email);
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getAuthority()));
    }

    private UserExtraHoursDTO toDTO(UserExtraHours entity) {
        UserExtraHoursDTO dto = new UserExtraHoursDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setDate(entity.getDate());
        dto.setHours(entity.getHours());
        dto.setComment(entity.getComment());
        dto.setStatus(entity.getStatus());
        if (entity.getReviewedBy() != null) {
            dto.setReviewedById(entity.getReviewedBy().getId());
            dto.setReviewedByName(entity.getReviewedBy().getName());
        }
        dto.setReviewedAt(entity.getReviewedAt());
        dto.setRejectionReason(entity.getRejectionReason());
        return dto;
    }
}
