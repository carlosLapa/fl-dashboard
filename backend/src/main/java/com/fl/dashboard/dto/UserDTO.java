package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
public class UserDTO {

    private Long id;

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 50 caracteres")
    @NotBlank(message = "Campo requerido")
    private String username;

    private String funcao;
    private String cargo;

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 30 caracteres")
    @NotBlank(message = "Campo requerido")
    @Email(message = "Introduza um email válido")
    private String email;

    private String password;
    private byte[] profileImage;

    private List<ProjetoDTO> projetos = new ArrayList<>();

    private List<TarefaDTO> tarefas;

    public UserDTO() {
    }

    public UserDTO(Long id, String username, String funcao, String cargo, String email, String password, byte[] profileImage) {
        this.id = id;
        this.username = username;
        this.funcao = funcao;
        this.cargo = cargo;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
    }

    public UserDTO(User entity) {
        id = entity.getId();
        username = entity.getUsername();
        funcao = entity.getFuncao();
        cargo = entity.getCargo();
        email = entity.getEmail();
        password = entity.getPassword();
        profileImage = entity.getProfileImage();
        projetos = entity.getProjetos().stream()
                .map(ProjetoDTO::new)
                .collect(Collectors.toList());
        tarefas = initializeTarefas(entity.getAssignedTarefas());
    }

    public UserDTO(User entity, Set<Projeto> projetos) {
        this(entity);
        projetos.forEach(proj -> this.projetos.add(new ProjetoDTO(proj)));
    }

    private List<TarefaDTO> initializeTarefas(Set<Tarefa> tarefas) {
        List<TarefaDTO> list = new ArrayList<>();
        for (Tarefa tarefa : tarefas) {
            TarefaDTO tarefaDTO = new TarefaDTO(tarefa, tarefa.getAssignedUsers(), tarefa.getProjeto());
            list.add(tarefaDTO);
        }
        return list;
    }

}
