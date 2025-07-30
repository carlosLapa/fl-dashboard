package com.fl.dashboard.resources;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.dto.UserDTO;
import com.fl.dashboard.dto.UserWithProjetosDTO;
import com.fl.dashboard.dto.UserWithRolesDTO;
import com.fl.dashboard.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/users")
public class UserResource {

    @Autowired
    private UserService userService;

    // Current user endpoint - no permission needed as users can access their own data
    @GetMapping("/me")
    public ResponseEntity<UserWithRolesDTO> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserWithRolesDTO userDTO = userService.getCurrentUserWithRoles(email);
        return ResponseEntity.ok().body(userDTO);
    }

    // Users with projects - requires VIEW_ALL_USERS permission
    @GetMapping("/with-projetos")
    @PreAuthorize("hasAuthority('VIEW_ALL_USERS')")
    public ResponseEntity<List<UserWithProjetosDTO>> findAllWithProjetos() {
        List<UserWithProjetosDTO> list = userService.findAllWithProjetos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping
    public ResponseEntity<Page<UserDTO>> findAll(Pageable pageable, Authentication authentication) {
        // Check if user has permission to view all users
        boolean canViewAllUsers = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_USERS") ||
                        a.getAuthority().equals("ROLE_ADMIN"));

        if (canViewAllUsers) {
            // Full access - return all user details
            Page<UserDTO> list = userService.findAllPaged(pageable);
            return ResponseEntity.ok().body(list);
        } else {
            // Limited access - return only basic info
            Page<UserDTO> list = userService.findAllBasicInfo(pageable);
            return ResponseEntity.ok().body(list);
        }
    }

    // Get user by ID with projects - requires VIEW_ALL_USERS permission
    @GetMapping("/{id}/with-projetos")
    @PreAuthorize("hasAuthority('VIEW_ALL_USERS')")
    public ResponseEntity<UserWithProjetosDTO> findByIdWithProjetos(@PathVariable Long id) {
        UserWithProjetosDTO dto = userService.findByIdWithProjetos(id);
        return ResponseEntity.ok().body(dto);
    }

    // Get user by ID - requires VIEW_ALL_USERS permission
    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('VIEW_ALL_USERS')")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id) {
        UserDTO userDTO = userService.findById(id);
        return ResponseEntity.ok().body(userDTO);
    }

    // Get tasks for a user - requires VIEW_ALL_TASKS or own tasks
    @GetMapping("/{userId}/tarefas")
    @PreAuthorize("hasAuthority('VIEW_ALL_TASKS') or (authentication.name == @userService.findById(#userId).email and hasAuthority('VIEW_ASSIGNED_TASKS'))")
    public ResponseEntity<List<TarefaDTO>> getTarefasByUser(@PathVariable Long userId) {
        List<TarefaDTO> tarefaDTOs = userService.getTarefasByUser(userId);
        return ResponseEntity.ok(tarefaDTOs);
    }

    // Create user with projects - requires CREATE_USER permission
    @PostMapping("/with-projetos")
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public ResponseEntity<UserWithProjetosDTO> insertWithProjetos(
            @RequestPart("user") @Valid UserWithProjetosDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        dto = userService.insertWithProjetos(dto, imageFile);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    // Create user - requires CREATE_USER permission
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public ResponseEntity<UserDTO> insert(@ModelAttribute UserDTO dto, @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        UserDTO newDto = userService.insert(dto, imageFile);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    // Update user with projects - requires EDIT_USER permission
    @PutMapping(value = "/{id}/with-projetos")
    @PreAuthorize("hasAuthority('EDIT_USER')")
    public ResponseEntity<UserWithProjetosDTO> updateWithProjetos(
            @PathVariable Long id,
            @RequestPart("user") @Valid UserWithProjetosDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        dto = userService.updateWithProjetos(id, dto, imageFile);
        return ResponseEntity.ok().body(dto);
    }

    // Update user - requires EDIT_USER permission
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('EDIT_USER')")
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @ModelAttribute UserDTO dto, @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        UserDTO updatedDto = userService.update(id, dto, imageFile);
        return ResponseEntity.ok().body(updatedDto);
    }

    // Delete user - requires DELETE_USER permission
    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Search users - requires VIEW_ALL_USERS permission
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_ALL_USERS')")
    public ResponseEntity<List<UserWithProjetosDTO>> searchUsers(@RequestParam String query) {
        List<UserWithProjetosDTO> results = userService.searchUsers(query);
        return ResponseEntity.ok().body(results);
    }
}
