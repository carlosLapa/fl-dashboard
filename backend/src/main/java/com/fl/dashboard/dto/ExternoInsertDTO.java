package com.fl.dashboard.dto;

import com.fl.dashboard.services.validation.ExternoInsertValid;

@ExternoInsertValid
public class ExternoInsertDTO extends ExternoDTO {
    // Inherits all fields and methods from ExternoDTO
    // The annotation will be used for custom validation

    public ExternoInsertDTO() {
        super();
    }
}
