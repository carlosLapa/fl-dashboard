package com.fl.dashboard.services;

import com.fl.dashboard.dto.UserDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png");
    private static final long MAX_FILE_SIZE = 2097152; // 2MB

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        List<User> list = userRepository.findAll();
        return list.stream().map(UserDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User entity = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Utilizador com o id: " + id + " não encontrado"));
        return new UserDTO(entity);
    }

    /*
    @Transactional
    public UserDTO insert(UserDTO userDTO) {
        User entity = new User();
        copyDTOtoEntity(userDTO, entity);
        entity = userRepository.save(entity);
        return new UserDTO(entity);
    }
    */

    @Transactional
    public UserDTO insert(UserDTO userDTO, MultipartFile imageFile) {
        User entity = new User();
        copyDTOtoEntity(userDTO, entity);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                entity.setProfileImage(imageFile.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error processing image file", e);
            }
        }

        entity = userRepository.save(entity);
        return new UserDTO(entity);
    }

    public UserDTO update(Long id, UserDTO userDTO, MultipartFile imageFile) {
        User entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        copyDTOtoEntity(userDTO, entity);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                entity.setProfileImage(imageFile.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error processing image file", e);
            }
        }

        entity = userRepository.save(entity);
        return new UserDTO(entity);
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            userRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(("Não permitido! Integridade da BD em causa"));
        }
    }

    private void copyDTOtoEntity(UserDTO userDTO, User entity) {
        entity.setUsername(userDTO.getUsername());
        entity.setFuncao(userDTO.getFuncao());
        entity.setCargo(userDTO.getCargo());
        entity.setEmail(userDTO.getEmail());
        entity.setPassword(userDTO.getPassword());
        entity.setProfileImage(userDTO.getProfileImage());
    }

    /*
    public void uploadUserImage(Long userId, MultipartFile imageFile) throws IOException {
        validateImage(imageFile);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setProfileImage(imageFile.getBytes());
            userRepository.save(user);
        } else {
            throw new ResourceNotFoundException("Utilizador com o id: " + userId + " não encontrado");
        }
    }
    */

    // Colocar um pré-alerta, no FRONTEND, caso o ficheiro carregado - mas antes de mandar persistir - exceda o tamanho máximo
    private void validateImage(MultipartFile imageFile) {
        if (!ALLOWED_CONTENT_TYPES.contains(imageFile.getContentType())) {
            throw new IllegalArgumentException("Ficheiro inválido. São permitidos JPEG e PNG");
        }
        if (imageFile.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Tamanho do ficheiro excede o limite de 5MB.");
        }
    }
}