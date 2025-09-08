package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ResetPasswordDTO;
import com.fl.dashboard.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminResource {

    @Autowired
    private UserService userService;

    @PostMapping("/reset-password")
    @PreAuthorize("hasAuthority('MANAGE_USER_PASSWORDS')")
    public ResponseEntity<Map<String, Object>> resetUserPassword(@Valid @RequestBody ResetPasswordDTO dto) {
        userService.resetPassword(dto.getUserId(), dto.getNewPassword());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Senha do usuário alterada com sucesso");
        response.put("timestamp", new Date());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-all-passwords")
    @PreAuthorize("hasAuthority('MANAGE_USER_PASSWORDS')")
    public ResponseEntity<Map<String, Object>> resetAllPasswords(@Valid @RequestBody ResetPasswordDTO dto) {
        int count = userService.resetAllPasswords(dto.getNewPassword());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Senhas atualizadas para " + count + " usuários");
        response.put("timestamp", new Date());

        return ResponseEntity.ok(response);
    }
}
