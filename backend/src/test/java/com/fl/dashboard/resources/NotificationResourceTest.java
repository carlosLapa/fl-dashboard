package com.fl.dashboard.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.dto.NotificationDTO;
import com.fl.dashboard.dto.NotificationInsertDTO;
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

    private NotificationDTO notificationDTO;
    private NotificationInsertDTO notificationInsertDTO;

    @BeforeEach
    void setUp() {
        notificationDTO = new NotificationDTO(1L, "TEST", "Test Content", false, null, null, 1L, null, null);
        notificationInsertDTO = new NotificationInsertDTO();
        notificationInsertDTO.setType("TEST");
        notificationInsertDTO.setContent("Test Content");
        notificationInsertDTO.setUserId(1L);
    }

    @Test
    void findAll() throws Exception {
        when(notificationService.findAllPaged(any())).thenReturn(new PageImpl<>(List.of(notificationDTO)));

        mockMvc.perform(get("/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].type").value("TEST"));
    }

    @Test
    void findById() throws Exception {
        when(notificationService.findById(1L)).thenReturn(notificationDTO);

        mockMvc.perform(get("/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("TEST"));
    }

    @Test
    void insert() throws Exception {
        when(notificationService.insert(any())).thenReturn(notificationDTO);

        mockMvc.perform(post("/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationInsertDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("TEST"));
    }

    @Test
    void update() throws Exception {
        when(notificationService.update(any(), any())).thenReturn(notificationDTO);

        mockMvc.perform(put("/notifications/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationInsertDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.type").value("TEST"));
    }

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

    @Test
    void findByUser() throws Exception {
        when(notificationService.findByUser(any(), any())).thenReturn(new PageImpl<>(List.of(notificationDTO)));

        mockMvc.perform(get("/notifications/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].type").value("TEST"));
    }

}

