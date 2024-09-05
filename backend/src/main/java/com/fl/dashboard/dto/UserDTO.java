package com.fl.dashboard.dto;

import com.fl.dashboard.entities.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UserDTO {

    private Long id;

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 50 caracteres")
    @NotBlank(message = "Campo requerido")
    private String name;

    private String funcao;
    private String cargo;

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 30 caracteres")
    @NotBlank(message = "Campo requerido")
    @Email(message = "Introduza um email válido")
    private String email;

    private String password;
    private byte[] profileImage;

    // private Set<ProjetoDTO> projetos = new HashSet<>();

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String funcao, String cargo, String email, String password, byte[] profileImage) {
        this.id = id;
        this.name = name;
        this.funcao = funcao;
        this.cargo = cargo;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
    }

    public UserDTO(User entity) {
        id = entity.getId();
        name = entity.getName();
        funcao = entity.getFuncao();
        cargo = entity.getCargo();
        email = entity.getEmail();
        password = entity.getPassword();
        profileImage = entity.getProfileImage();
    }

    /*
    public UserDTO(User entity, Set<Projeto> projetos) {
        this(entity);
        projetos.forEach(proj -> this.projetos.add(new ProjetoDTO(proj)));
    }
    */

}
