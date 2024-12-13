package com.fl.dashboard.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.config.SecurityTestConfig;
import com.fl.dashboard.dto.*;
import com.fl.dashboard.repositories.NotificationRepository;
import com.fl.dashboard.services.NotificationService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKMatcher;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(SecurityTestConfig.class)
public class NotificationResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JWKSource<SecurityContext> testJwkSource;

    private String accessToken;

    @MockBean
    private NotificationService notificationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @MockBean
    private SimpMessagingTemplate messagingTemplate;
    private NotificationResponseDTO notificationResponseDTO;
    private NotificationInsertDTO notificationInsertDTO;

    @BeforeEach
    void setUp() {
        try {
            setupJwtToken();
            setupNotificationResponseDTO();
            setupNotificationInsertDTO();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setupJwtToken() throws Exception {
        JWKSelector selector = new JWKSelector(new JWKMatcher.Builder().build());
        List<JWK> jwks = testJwkSource.get(selector, null);
        JWK jwk = jwks.get(0);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject("test@example.com")
                .claim("authorities", Arrays.asList("ROLE_ADMIN"))
                .claim("username", "test@example.com")
                .expirationTime(new Date(System.currentTimeMillis() + 3600 * 1000))
                .issueTime(new Date())
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).build(),
                claims);

        RSASSASigner signer = new RSASSASigner((RSAKey) jwk);
        signedJWT.sign(signer);
        accessToken = signedJWT.serialize();
    }

    private void setupNotificationResponseDTO() {
        notificationResponseDTO = new NotificationResponseDTO();
        notificationResponseDTO.setId(1L);
        notificationResponseDTO.setType("NOTIFICACAO_GERAL");
        notificationResponseDTO.setContent("Test Content");
        notificationResponseDTO.setIsRead(false);
        notificationResponseDTO.setCreatedAt(new Date());
        notificationResponseDTO.setRelatedId(null);

        UserMinDTO userDto = new UserMinDTO();
        userDto.setId(1L);
        userDto.setName("Test User");
        notificationResponseDTO.setUser(userDto);

        TarefaMinDTO tarefaDto = new TarefaMinDTO();
        tarefaDto.setId(1L);
        tarefaDto.setDescricao("Test Tarefa");
        notificationResponseDTO.setTarefa(tarefaDto);

        ProjetoMinDTO projetoDto = new ProjetoMinDTO();
        projetoDto.setId(1L);
        projetoDto.setDesignacao("Test Projeto");
        notificationResponseDTO.setProjeto(projetoDto);
    }

    private void setupNotificationInsertDTO() {
        notificationInsertDTO = new NotificationInsertDTO();
        notificationInsertDTO.setType("NOTIFICACAO_GERAL");
        notificationInsertDTO.setContent("Test Content");
        notificationInsertDTO.setUserId(1L);
        notificationInsertDTO.setTarefaId(1L);
        notificationInsertDTO.setProjetoId(1L);
    }

    @Test
    void findAll() throws Exception {
        when(notificationService.findAllPaged(any())).thenReturn(new PageImpl<>(List.of(notificationResponseDTO)));

        mockMvc.perform(get("/notifications")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].type").value("NOTIFICACAO_GERAL"))
                .andExpect(jsonPath("$.content[0].user.id").value(1L))
                .andExpect(jsonPath("$.content[0].tarefa.id").value(1L))
                .andExpect(jsonPath("$.content[0].projeto.id").value(1L));
    }

    @Test
    void findById() throws Exception {
        when(notificationService.findById(1L)).thenReturn(notificationResponseDTO);

        mockMvc.perform(get("/notifications/1")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("NOTIFICACAO_GERAL"))
                .andExpect(jsonPath("$.user.name").value("Test User"))
                .andExpect(jsonPath("$.tarefa.descricao").value("Test Tarefa"))
                .andExpect(jsonPath("$.projeto.designacao").value("Test Projeto"));
    }

    @Test
    void insert() throws Exception {
        when(notificationService.insert(any())).thenReturn(notificationResponseDTO);

        mockMvc.perform(post("/notifications")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationInsertDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("NOTIFICACAO_GERAL"));
    }

    @Test
    void update() throws Exception {
        when(notificationService.update(any(), any())).thenReturn(notificationResponseDTO);

        mockMvc.perform(put("/notifications/1")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationInsertDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("NOTIFICACAO_GERAL"));
    }

    @Test
    void findByUser() throws Exception {
        when(notificationService.findByUser(any(), any())).thenReturn(new PageImpl<>(List.of(notificationResponseDTO)));

        mockMvc.perform(get("/notifications/user/1")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].type").value("NOTIFICACAO_GERAL"))
                .andExpect(jsonPath("$.content[0].user.id").value(1L))
                .andExpect(jsonPath("$.content[0].tarefa.id").value(1L))
                .andExpect(jsonPath("$.content[0].projeto.id").value(1L));
    }

    @Test
    void findAllShouldReturnEmptyPageWhenNoNotifications() throws Exception {
        when(notificationService.findAllPaged(any())).thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/notifications")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void findByIdShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        when(notificationService.findById(99L)).thenThrow(ResourceNotFoundException.class);

        mockMvc.perform(get("/notifications/99")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void findByUserShouldReturnUnreadNotificationsFirst() throws Exception {
        NotificationResponseDTO unreadNotification = notificationResponseDTO;
        NotificationResponseDTO readNotification = new NotificationResponseDTO();
        readNotification.setId(2L);
        readNotification.setIsRead(true);

        when(notificationService.findByUser(any(), any()))
                .thenReturn(new PageImpl<>(List.of(unreadNotification, readNotification)));

        mockMvc.perform(get("/notifications/user/1")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].isRead").value(false))
                .andExpect(jsonPath("$.content[1].isRead").value(true));
    }

    // Delete and markAsRead tests remain the same as they don't return data
    @Test
    void delete() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/notifications/{id}", 1)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void markAsRead() throws Exception {
        mockMvc.perform(patch("/notifications/1/read")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        doThrow(ResourceNotFoundException.class).when(notificationService).delete(99L);

        mockMvc.perform(MockMvcRequestBuilders.delete("/notifications/99")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void markAsReadShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        doThrow(ResourceNotFoundException.class).when(notificationService).markAsRead(99L);

        mockMvc.perform(patch("/notifications/99/read")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Import(SecurityTestConfig.class)
    @TestConfiguration
    static class TestConfig {
    }
}
