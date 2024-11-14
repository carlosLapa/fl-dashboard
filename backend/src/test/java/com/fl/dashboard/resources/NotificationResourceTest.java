package com.fl.dashboard.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.dto.*;
import com.fl.dashboard.services.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class NotificationResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Autowired
    private ObjectMapper objectMapper;

    private NotificationResponseDTO notificationResponseDTO;
    private NotificationInsertDTO notificationInsertDTO;

    @BeforeEach
    void setUp() {
        notificationResponseDTO = new NotificationResponseDTO();
        notificationResponseDTO.setId(1L);
        notificationResponseDTO.setType("TEST");
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

        notificationInsertDTO = new NotificationInsertDTO();
        notificationInsertDTO.setType("TEST");
        notificationInsertDTO.setContent("Test Content");
        notificationInsertDTO.setUserId(1L);
        notificationInsertDTO.setTarefaId(1L);
        notificationInsertDTO.setProjetoId(1L);
    }

    @Test
    void findAll() throws Exception {
        when(notificationService.findAllPaged(any())).thenReturn(new PageImpl<>(List.of(notificationResponseDTO)));

        mockMvc.perform(get("/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].type").value("TEST"))
                .andExpect(jsonPath("$.content[0].user.id").value(1L))
                .andExpect(jsonPath("$.content[0].tarefa.id").value(1L))
                .andExpect(jsonPath("$.content[0].projeto.id").value(1L));
    }

    @Test
    void findById() throws Exception {
        when(notificationService.findById(1L)).thenReturn(notificationResponseDTO);

        mockMvc.perform(get("/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("TEST"))
                .andExpect(jsonPath("$.user.name").value("Test User"))
                .andExpect(jsonPath("$.tarefa.descricao").value("Test Tarefa"))
                .andExpect(jsonPath("$.projeto.designacao").value("Test Projeto"));
    }

    @Test
    void insert() throws Exception {
        when(notificationService.insert(any())).thenReturn(notificationResponseDTO);

        mockMvc.perform(post("/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationInsertDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("TEST"));
    }

    @Test
    void update() throws Exception {
        when(notificationService.update(any(), any())).thenReturn(notificationResponseDTO);

        mockMvc.perform(put("/notifications/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationInsertDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("TEST"));
    }

    @Test
    void findByUser() throws Exception {
        when(notificationService.findByUser(any(), any())).thenReturn(new PageImpl<>(List.of(notificationResponseDTO)));

        mockMvc.perform(get("/notifications/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].type").value("TEST"))
                .andExpect(jsonPath("$.content[0].user.id").value(1L))
                .andExpect(jsonPath("$.content[0].tarefa.id").value(1L))
                .andExpect(jsonPath("$.content[0].projeto.id").value(1L));
    }

    // Delete and markAsRead tests remain the same as they don't return data
    @Test
    void delete() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/notifications/{id}", 1))
                .andExpect(status().isNoContent());
    }

    @Test
    void markAsRead() throws Exception {
        mockMvc.perform(patch("/notifications/1/read"))
                .andExpect(status().isNoContent());
    }
}


