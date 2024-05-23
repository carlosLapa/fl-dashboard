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

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 30 caracteres")
    @NotBlank(message = "Campo requerido")
    private String firstName;

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 30 caracteres")
    @NotBlank(message = "Campo requerido")
    private String lastName;

    @Size(min = 3, max = 30, message = "Nome deve conter de 3 a 30 caracteres")
    @NotBlank(message = "Campo requerido")

    @Email(message = "Introduza um email válido")
    private String email;
    private String password;

    public UserDTO() {
    }

    public UserDTO(Long id, String firstName, String lastName, String email, String password) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    public UserDTO(User entity) {
        id = entity.getId();
        firstName = entity.getFirstName();
        lastName = entity.getLastName();
        email = entity.getEmail();
        password = entity.getPassword();
    }
}
