package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.enums.EspecialidadesExterno;
import com.fl.dashboard.enums.FaseProjeto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString
public class ExternoDTO {
    private Long id;

    @Size(min = 3, max = 50, message = "Nome deve conter de 3 a 50 caracteres")
    @NotBlank(message = "Campo requerido")
    private String name;

    @Size(min = 3, max = 30, message = "Email deve conter de 3 a 30 caracteres")
    @NotBlank(message = "Campo requerido")
    @Email(message = "Introduza um email válido")
    private String email;

    private String telemovel;
    private BigDecimal preco;
    private FaseProjeto faseProjeto;
    private Set<EspecialidadesExterno> especialidades = new HashSet<>();

    public ExternoDTO() {
    }

    public ExternoDTO(Long id, String name, String email, String telemovel,
                      BigDecimal preco, FaseProjeto faseProjeto) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.telemovel = telemovel;
        this.preco = preco;
        this.faseProjeto = faseProjeto;
    }

    public ExternoDTO(Externo entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.email = entity.getEmail();
        this.telemovel = entity.getTelemovel();
        this.preco = entity.getPreco();
        this.faseProjeto = entity.getFaseProjeto();
        this.especialidades = entity.getEspecialidades();
    }
}
