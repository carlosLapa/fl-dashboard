package com.fl.dashboard.resources;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.dto.UserDTO;
import com.fl.dashboard.dto.UserWithProjetosDTO;
import com.fl.dashboard.dto.UserWithRolesDTO;
import com.fl.dashboard.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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


    @GetMapping("/me")
    public ResponseEntity<UserWithRolesDTO> getCurrentUser(Authentication authentication) {
        String email = authentication.getName(); // Gets the username (email) from JWT
        UserWithRolesDTO userDTO = userService.getCurrentUserWithRoles(email);
        return ResponseEntity.ok().body(userDTO);
    }

    @GetMapping("/with-projetos")
    public ResponseEntity<List<UserWithProjetosDTO>> findAllWithProjetos() {
        List<UserWithProjetosDTO> list = userService.findAllWithProjetos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> findAll() {
        List<UserDTO> list = userService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{id}/with-projetos")
    public ResponseEntity<UserWithProjetosDTO> findByIdWithProjetos(@PathVariable Long id) {
        UserWithProjetosDTO dto = userService.findByIdWithProjetos(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id) {
        UserDTO userDTO = userService.findById(id);
        return ResponseEntity.ok().body(userDTO);
    }

    @GetMapping("/{userId}/tarefas")
    public ResponseEntity<List<TarefaDTO>> getTarefasByUser(@PathVariable Long userId) {
        List<TarefaDTO> tarefaDTOs = userService.getTarefasByUser(userId);
        return ResponseEntity.ok(tarefaDTOs);
    }

    @PostMapping("/with-projetos")
    public ResponseEntity<UserWithProjetosDTO> insertWithProjetos(
            @RequestPart("user") @Valid UserWithProjetosDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        dto = userService.insertWithProjetos(dto, imageFile);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> insert(@ModelAttribute UserDTO dto, @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        UserDTO newDto = userService.insert(dto, imageFile);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping(value = "/{id}/with-projetos")
    public ResponseEntity<UserWithProjetosDTO> updateWithProjetos(
            @PathVariable Long id,
            @RequestPart("user") @Valid UserWithProjetosDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        dto = userService.updateWithProjetos(id, dto, imageFile);
        return ResponseEntity.ok().body(dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @ModelAttribute UserDTO dto, @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        UserDTO updatedDto = userService.update(id, dto, imageFile);
        return ResponseEntity.ok().body(updatedDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserWithProjetosDTO>> searchUsers(@RequestParam String query) {
        List<UserWithProjetosDTO> results = userService.searchUsers(query);
        return ResponseEntity.ok().body(results);
    }

}
