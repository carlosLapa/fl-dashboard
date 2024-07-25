package com.fl.dashboard.resources;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.dto.UserDTO;
import com.fl.dashboard.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<List<UserDTO>> findAll() {
        List<UserDTO> list = userService.findAll();
        return ResponseEntity.ok().body(list);
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> insert(@ModelAttribute UserDTO dto, @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        UserDTO newDto = userService.insert(dto, imageFile);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
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

    /*
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadUserImage(@PathVariable Long id, @RequestParam("image") MultipartFile imageFile) {
        try {
            userService.uploadUserImage(id, imageFile);
            return new ResponseEntity<>("Imagem carregada com sucesso", HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Falha no carregamento da imagem", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    */

}
