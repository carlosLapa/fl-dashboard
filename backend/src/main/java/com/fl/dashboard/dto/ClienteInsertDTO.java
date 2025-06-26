package com.fl.dashboard.dto;

import com.fl.dashboard.services.validation.ClienteInsertValid;

@ClienteInsertValid
public class ClienteInsertDTO extends ClienteDTO {
    // Inherits all fields and methods from ClienteDTO
    // The annotation will be used for custom validation

    public ClienteInsertDTO() {
        super();
    }
}
