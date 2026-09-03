package com.fl.dashboard.dto;

import com.fl.dashboard.entities.ProjetoLink;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjetoLinkDTO {

    private Long id;

    @NotBlank(message = "URL é obrigatório")
    @Size(max = 500, message = "URL deve ter no máximo 500 caracteres")
    // Rendered as a clickable <a href> to the user, so a javascript:/data: scheme here would be
    // a stored-XSS vector — restrict to http(s) links only.
    @Pattern(regexp = "^https?://.+", message = "URL deve começar por http:// ou https://")
    private String url;

    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String descricao;

    public ProjetoLinkDTO() {
    }

    public ProjetoLinkDTO(ProjetoLink entity) {
        this.id = entity.getId();
        this.url = entity.getUrl();
        this.descricao = entity.getDescricao();
    }
}
