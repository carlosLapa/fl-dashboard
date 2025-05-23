package com.fl.dashboard.services.validation;

import com.fl.dashboard.dto.ExternoInsertDTO;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.resources.exceptions.FieldMessage;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

public class ExternoInsertValidator implements ConstraintValidator<ExternoInsertValid, ExternoInsertDTO> {
    @Autowired
    private ExternoRepository externoRepository;

    @Override
    public void initialize(ExternoInsertValid ann) {
        // Method intentionally left empty
    }

    @Override
    public boolean isValid(ExternoInsertDTO dto, ConstraintValidatorContext context) {
        List<FieldMessage> list = new ArrayList<>();

        // Check if email already exists
        var externoWithSameEmail = externoRepository.findByEmail(dto.getEmail());
        if (externoWithSameEmail.isPresent()) {
            list.add(new FieldMessage("email", "Email já existe! Por favor insira outro email"));
        }

        // Check if at least one especialidade is selected
        if (dto.getEspecialidades() == null || dto.getEspecialidades().isEmpty()) {
            list.add(new FieldMessage("especialidades", "Pelo menos uma especialidade deve ser selecionada"));
        }

        // Add more validations as needed

        for (FieldMessage e : list) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(e.getMessage())
                    .addPropertyNode(e.getFieldName())
                    .addConstraintViolation();
        }

        return list.isEmpty();
    }
}
