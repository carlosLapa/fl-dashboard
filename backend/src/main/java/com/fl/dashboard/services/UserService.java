package com.fl.dashboard.services;

import com.fl.dashboard.config.PermissionMapper;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png");
    private static final long MAX_FILE_SIZE = 2097152; // 2MB
    // Profile photos are only ever displayed as small thumbnails (e.g. 90x90 in the collaborators
    // table); storing/serving them at upload resolution meant a single avatar fetch could transfer
    // a couple of MB. 180px is ~2x the largest current display size (90px), enough headroom for
    // retina/high-DPI screens without shipping far more pixels than will ever be shown.
    private static final int MAX_PROFILE_IMAGE_DIMENSION = 180;
    private static final float PROFILE_IMAGE_JPEG_QUALITY = 0.8f;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final ProjetoRepository projetoRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, ProjetoRepository projetoRepository,
                       NotificationRepository notificationRepository, PasswordEncoder passwordEncoder,
                       RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.projetoRepository = projetoRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }


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
            // System.out.println("Created new role: " + defaultRoleName);
        }

        entity.addRole(defaultRole);
    }

    @Transactional(readOnly = true)
    public UserWithRolesDTO getCurrentUserWithRoles(String emailOrClientId) {
        User user = null;

        // First try to find by email directly
        user = userRepository.findByEmail(emailOrClientId);

        // If not found, and it looks like a client ID, we need to get the email from the SecurityContext
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
        // Was calling plain findAll() — projetos was never eagerly fetched, so every user paid for
        // its own lazy-load query (unbatched, since only Projeto.externos/Tarefa.externos carry
        // @BatchSize). findAllWithProjetos() actually uses the {"projetos"} EntityGraph.
        List<User> list = userRepository.findAllWithProjetos();
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

    /**
     * Find all users with pagination
     *
     * @param pageable Pagination parameters
     * @return Page of UserDTO with full user details
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> findAllPaged(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return page.map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Page<UserWithRolesDTO> findAllPagedWithRoles(Pageable pageable) {
        Page<Long> idsPage = userRepository.findAllIds(pageable);
        if (idsPage.isEmpty()) {
            return Page.empty(pageable);
        }
        Map<Long, User> userById = userRepository.findAllByIdInWithRoles(idsPage.getContent()).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        List<UserWithRolesDTO> dtos = idsPage.getContent().stream()
                .map(userById::get)
                .filter(Objects::nonNull)
                .map(UserWithRolesDTO::new)
                // profileImage can be a couple hundred KB per user; embedding it in every row of a
                // paginated list (rather than lazily via GET /users/{id}/profile-image) turned a
                // 10-row page into several MB of JSON. Single-user fetches (findById, used by the
                // edit modal) still include it.
                .peek(dto -> dto.setProfileImage(null))
                .toList();
        return new PageImpl<>(dtos, pageable, idsPage.getTotalElements());
    }

    /**
     * Find all users with pagination, returning only basic information
     *
     * @param pageable Pagination parameters
     * @return Page of UserDTO with limited user details
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> findAllBasicInfo(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return page.map(user -> {
            UserDTO dto = new UserDTO(user);
            // Remove sensitive information for non-admin users
            dto.setPassword(null);
            // See findAllPagedWithRoles: profileImage belongs behind GET /users/{id}/profile-image,
            // not embedded in every row of a paginated list.
            dto.setProfileImage(null);
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public byte[] getProfileImage(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Utilizador com o id: " + id + " não encontrado"));
        return user.getProfileImage();
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = null;
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            email = jwtToken.getToken().getClaimAsString("email");
        } else {
            email = auth.getName();
        }
        User currentUser = userRepository.findByEmail(email);
        boolean isManager = currentUser.getRoles().stream()
                .anyMatch(role -> "ROLE_MANAGER".equals(role.getAuthority()));

        User entity = userRepository.getReferenceById(id);
        boolean isTargetAdmin = entity.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getAuthority()));

        if (isManager && isTargetAdmin) {
            throw new DatabaseException("Managers cannot edit Admin users.");
        }
        try {
            // ...existing update logic...
            String currentPassword = entity.getPassword();
            copyDTOtoEntity(userDTO, entity);
            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                entity.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            } else {
                entity.setPassword(currentPassword);
            }
            if (imageFile != null && !imageFile.isEmpty()) {
                entity.setProfileImage(imageFile.getBytes());
            }
            entity = userRepository.save(entity);
            return new UserDTO(entity);
        } catch (EntityNotFoundException | IOException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        guardManagerCannotTargetAdmin(id);
        try {
            // Delete all notifications for this user
            notificationRepository.deleteAllByUserId(id);
            // Delete all task-user associations for this user
            userRepository.deleteTaskUserAssociationsByUserId(id);
            // Delete all projeto-user associations for this user
            userRepository.deleteProjetoUserAssociationsByUserId(id);
            // Un-assign this user as coordenador wherever they hold that role
            userRepository.clearCoordenadorByUserId(id);
            // Finally delete the user
            userRepository.deleteById(id);
            // Force the DELETE to hit the DB now, inside this try block, instead of letting
            // Hibernate defer the flush to transaction commit (which happens after this method
            // returns and would let a FK violation escape uncaught as a raw 500).
            userRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não é possível apagar: existem registos associados a este utilizador " +
                    "(tarefas, subtarefas ou histórico de projetos). Considere desativar em vez de apagar.");
        }
    }

    @Transactional
    public UserDTO deactivate(Long id) {
        if (getCurrentAuthenticatedUser().getId().equals(id)) {
            throw new DatabaseException("Não pode desativar a sua própria conta.");
        }
        User entity = getExistingUser(id);
        guardManagerCannotTargetAdmin(id);
        entity.setAtivo(false);
        entity = userRepository.save(entity);
        return new UserDTO(entity);
    }

    @Transactional
    public UserDTO reactivate(Long id) {
        User entity = getExistingUser(id);
        guardManagerCannotTargetAdmin(id);
        entity.setAtivo(true);
        entity = userRepository.save(entity);
        return new UserDTO(entity);
    }

    private User getExistingUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurso não encontrado"));
    }

    private void guardManagerCannotTargetAdmin(Long targetId) {
        User currentUser = getCurrentAuthenticatedUser();
        boolean isManager = currentUser.getRoles().stream()
                .anyMatch(role -> "ROLE_MANAGER".equals(role.getAuthority()));

        User entity = userRepository.getReferenceById(targetId);
        boolean isTargetAdmin = entity.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getAuthority()));

        if (isManager && isTargetAdmin) {
            throw new DatabaseException("Managers cannot edit Admin users.");
        }
    }

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
                entity.setProfileImage(resizeProfileImage(imageFile.getBytes()));
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

    // Downscales to a small thumbnail and re-encodes as JPEG, regardless of the source format/size,
    // so every stored profile image is cheap to serve.
    private byte[] resizeProfileImage(byte[] originalBytes) throws IOException {
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(originalBytes));
        if (original == null) {
            throw new IllegalArgumentException("Ficheiro de imagem inválido");
        }

        int width = original.getWidth();
        int height = original.getHeight();
        double scale = Math.min(
                1.0,
                Math.min((double) MAX_PROFILE_IMAGE_DIMENSION / width, (double) MAX_PROFILE_IMAGE_DIMENSION / height));
        int targetWidth = Math.max(1, (int) Math.round(width * scale));
        int targetHeight = Math.max(1, (int) Math.round(height * scale));

        // JPEG has no alpha channel, so flatten onto white (covers transparent PNG uploads) while
        // scaling down in the same pass.
        BufferedImage resized = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, targetWidth, targetHeight);
            g.drawImage(original, 0, 0, targetWidth, targetHeight, null);
        } finally {
            g.dispose();
        }

        return encodeAsJpeg(resized);
    }

    private byte[] encodeAsJpeg(BufferedImage image) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IllegalStateException("No JPEG image writer available");
        }
        ImageWriter writer = writers.next();
        try {
            ImageWriteParam params = writer.getDefaultWriteParam();
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(PROFILE_IMAGE_JPEG_QUALITY);
            try (ImageOutputStream ios = ImageIO.createImageOutputStream(output)) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(image, null, null), params);
            }
        } finally {
            writer.dispose();
        }
        return output.toByteArray();
    }

    // One-off maintenance pass to shrink profile images that were uploaded before resizing was
    // added — resizeProfileImage only applies to new uploads. Safe to call repeatedly: already-small
    // images are re-encoded but not meaningfully changed.
    @Transactional
    public int reprocessAllProfileImages() {
        List<User> users = userRepository.findAll();
        int processed = 0;
        for (User user : users) {
            byte[] image = user.getProfileImage();
            if (image == null || image.length == 0) {
                continue;
            }
            try {
                user.setProfileImage(resizeProfileImage(image));
                userRepository.save(user);
                processed++;
            } catch (IOException | IllegalArgumentException e) {
                logger.warn("Could not reprocess profile image for user {}: {}", user.getId(), e.getMessage());
            }
        }
        return processed;
    }

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        List<UserDetailsProjection> result = userRepository.searchUserAndRolesByEmail(username);
        if (result.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }

        User user = new User();
        user.setEmail(result.get(0).getUsername());
        user.setPassword(result.get(0).getPassword());
        boolean ativo = !Boolean.FALSE.equals(result.get(0).getAtivo());

        // Standard authorities (roles)
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();

        for (UserDetailsProjection projection : result) {
            Role role = new Role(projection.getRoleId(), projection.getAuthority());
            user.addRole(role);

            // Add role as authority
            authorities.add(new SimpleGrantedAuthority(role.getAuthority()));

            // Add role permissions as authorities
            try {
                // Try to parse the role authority as a RoleType enum
                String roleType = role.getAuthority().replace("ROLE_", "");
                RoleType enumRoleType = RoleType.valueOf(roleType);

                // Get all permissions for this role
                Set<String> permissionNames = PermissionMapper.getPermissionNamesForRole(enumRoleType);
                for (String permissionName : permissionNames) {
                    authorities.add(new SimpleGrantedAuthority(permissionName));
                }
            } catch (IllegalArgumentException e) {
                // If role doesn't match any RoleType, just continue
                // System.out.println("Warning: Couldn't parse role as RoleType: " + role.getAuthority());
            }
        }

        // Return a UserDetails object with both roles and permissions as authorities
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                ativo, true, true, true,
                authorities
        );
    }

    @Transactional(readOnly = true)
    public List<UserWithProjetosDTO> searchUsers(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        List<User> users = userRepository.findByNameLikeIgnoreCaseOrEmailLikeIgnoreCase(searchQuery, searchQuery);
        return users.stream()
                .map(UserWithProjetosDTO::new)
                .toList();
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizador não encontrado com o ID: " + userId));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public int resetAllPasswords(String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres");
        }

        List<User> users = userRepository.findAll();
        int successCount = 0;

        for (User user : users) {
            try {
                resetPassword(user.getId(), newPassword);
                successCount++;
            } catch (Exception e) {
                logger.error("Falha ao redefinir password para o utilizador id={}, email={}: {}",
                        user.getId(), user.getEmail(), e.getMessage());
            }
        }

        return successCount;
    }

}
