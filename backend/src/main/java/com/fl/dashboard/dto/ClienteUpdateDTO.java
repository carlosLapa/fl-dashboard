package com.fl.dashboard.dto;

import com.fl.dashboard.services.validation.ClienteUpdateValid;

@ClienteUpdateValid
public class ClienteUpdateDTO extends ClienteDTO {
    // Inherits all fields and methods from ClienteDTO
    // The annotation will be used for custom validation

    public ClienteUpdateDTO() {
        super();
    }
}

