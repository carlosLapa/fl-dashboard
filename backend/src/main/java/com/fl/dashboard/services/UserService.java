package com.fl.dashboard.services;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.dto.UserDTO;
import com.fl.dashboard.dto.UserWithProjetosDTO;
import com.fl.dashboard.dto.UserWithRolesDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Role;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.RoleType;
import com.fl.dashboard.projections.UserDetailsProjection;
import com.fl.dashboard.repositories.NotificationRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.RoleRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png");
    private static final long MAX_FILE_SIZE = 2097152; // 2MB

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    // Helper method to assign default role
    private void assignDefaultRole(User entity) {
        // Use the EMPLOYEE enum value as the default role
        String defaultRoleName = "ROLE_" + RoleType.EMPLOYEE.name();

        Role defaultRole = roleRepository.findByAuthority(defaultRoleName)
                .orElse(null);

        // If not found with ROLE_ prefix, try without it
        if (defaultRole == null) {
            defaultRole = roleRepository.findByAuthority(RoleType.EMPLOYEE.name())
                    .orElse(null);
        }

        // If still not found, create the role
        if (defaultRole == null) {
            defaultRole = new Role();
            defaultRole.setAuthority(defaultRoleName);
            defaultRole = roleRepository.save(defaultRole);
            System.out.println("Created new role: " + defaultRoleName);
        }

        entity.addRole(defaultRole);
    }

    @Transactional(readOnly = true)
    public UserWithRolesDTO getCurrentUserWithRoles(String emailOrClientId) {
        User user = null;

        // First try to find by email directly
        user = userRepository.findByEmail(emailOrClientId);

        // If not found and it looks like a client ID, we need to get the email from the SecurityContext
        if (user == null) {
            // Get the current authentication from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof JwtAuthenticationToken jwtToken) {
                // Try to get email from JWT claims
                String email = jwtToken.getToken().getClaimAsString("email");
                if (email != null) {
                    user = userRepository.findByEmail(email);
                }
            }
        }

        if (user == null) {
            throw new ResourceNotFoundException("User not found: " + emailOrClientId);
        }

        return new UserWithRolesDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        List<User> list = userRepository.findAll();
        return list.stream().map(UserDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<UserWithProjetosDTO> findAllWithProjetos() {
        List<User> list = userRepository.findAll();
        return list.stream().map(UserWithProjetosDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public UserWithProjetosDTO findByIdWithProjetos(Long id) {
        User entity = userRepository.findByIdWithProjetos(id).orElseThrow(
                () -> new ResourceNotFoundException("Utilizador com o id: " + id + " não encontrado"));
        return new UserWithProjetosDTO(entity);
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User entity = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Utilizador com o id: " + id + " não encontrado"));
        return new UserDTO(entity);
    }

    @Transactional
    public List<TarefaDTO> getTarefasByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        Set<Tarefa> assignedTarefas = user.getTarefas();
        return assignedTarefas.stream()
                .map(TarefaDTO::new)
                .toList();
    }

    @Transactional
    public UserWithProjetosDTO insertWithProjetos(UserWithProjetosDTO userDTO, MultipartFile imageFile) {
        User entity = new User();
        copyDTOtoEntity(userDTO, entity);

        // Encode password for new users
        if (entity.getPassword() != null && !entity.getPassword().isEmpty()) {
            entity.setPassword(passwordEncoder.encode(entity.getPassword()));
        }

        copyProjetosToEntity(userDTO, entity);

        // Assign default role
        assignDefaultRole(entity);

        if (imageFile != null && !imageFile.isEmpty()) {
            processImageFile(entity, imageFile);
        }
        entity = userRepository.save(entity);
        return new UserWithProjetosDTO(entity);
    }

    @Transactional
    public UserDTO insert(UserDTO userDTO, MultipartFile imageFile) {
        User entity = new User();
        copyDTOtoEntity(userDTO, entity);

        // Encode password for new users
        if (entity.getPassword() != null && !entity.getPassword().isEmpty()) {
            entity.setPassword(passwordEncoder.encode(entity.getPassword()));
        }

        // Assign default role
        assignDefaultRole(entity);

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

    @Transactional
    public UserDTO update(Long id, UserDTO userDTO, MultipartFile imageFile) {
        try {
            User entity = userRepository.getReferenceById(id);

            // Store the current password
            String currentPassword = entity.getPassword();

            copyDTOtoEntity(userDTO, entity);

            // Handle password update
            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                // Encode the new password
                entity.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            } else {
                // Keep the current password if none provided
                entity.setPassword(currentPassword);
            }

            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    entity.setProfileImage(imageFile.getBytes());
                } catch (IOException e) {
                    throw new RuntimeException("Error processing image file", e);
                }
            }

            entity = userRepository.save(entity);
            return new UserDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            // Delete all notifications for this user
            notificationRepository.deleteAllByUserId(id);
            // Delete all task-user associations for this user
            userRepository.deleteTaskUserAssociationsByUserId(id);
            // Finally delete the user
            userRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não permitido! Integridade da BD em causa: " + e.getMessage());
        }
    }

    private void copyDTOtoEntity(UserDTO userDTO, User entity) {
        entity.setName(userDTO.getName());
        entity.setFuncao(userDTO.getFuncao());
        entity.setCargo(userDTO.getCargo());
        entity.setEmail(userDTO.getEmail());
        entity.setPassword(userDTO.getPassword());
        entity.setProfileImage(userDTO.getProfileImage());
    }

    private void copyProjetosToEntity(UserWithProjetosDTO userDTO, User entity) {
        entity.getProjetos().clear();
        userDTO.getProjetos().forEach(projetoDTO -> {
            Projeto projeto = projetoRepository.getReferenceById(projetoDTO.getId());
            entity.getProjetos().add(projeto);
        });
    }

    @Transactional
    public UserWithProjetosDTO updateWithProjetos(Long id, UserWithProjetosDTO userDTO, MultipartFile imageFile) {
        try {
            User entity = userRepository.getReferenceById(id);

            // Store the current password
            String currentPassword = entity.getPassword();

            copyDTOtoEntity(userDTO, entity);

            // Handle password update
            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                // Encode the new password
                entity.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            } else {
                // Keep the current password if none provided
                entity.setPassword(currentPassword);
            }

            copyProjetosToEntity(userDTO, entity);
            if (imageFile != null && !imageFile.isEmpty()) {
                processImageFile(entity, imageFile);
            }
            entity = userRepository.save(entity);
            return new UserWithProjetosDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    private void processImageFile(User entity, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                validateImage(imageFile);
                entity.setProfileImage(imageFile.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error processing image file", e);
            }
        }
    }

    private void validateImage(MultipartFile imageFile) {
        if (!ALLOWED_CONTENT_TYPES.contains(imageFile.getContentType())) {
            throw new IllegalArgumentException("Ficheiro inválido. São permitidos JPEG e PNG");
        }
        if (imageFile.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Tamanho do ficheiro excede o limite de 2MB.");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        List<UserDetailsProjection> result = userRepository.searchUserAndRolesByEmail(username);
        if (result.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }
        User user = new User();
        user.setEmail(result.get(0).getUsername());
        user.setPassword(result.get(0).getPassword());
        for (UserDetailsProjection projection : result) {
            user.addRole(new Role(projection.getRoleId(), projection.getAuthority()));
        }
        return user;
    }

    @Transactional(readOnly = true)
    public List<UserWithProjetosDTO> searchUsers(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        List<User> users = userRepository.findByNameLikeIgnoreCaseOrEmailLikeIgnoreCase(searchQuery, searchQuery);
        return users.stream()
                .map(UserWithProjetosDTO::new)
                .toList();
    }
}
