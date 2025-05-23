package com.fl.dashboard.services.validation;

import com.fl.dashboard.dto.ExternoUpdateDTO;
import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.resources.exceptions.FieldMessage;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ExternoUpdateValidator implements ConstraintValidator<ExternoUpdateValid, ExternoUpdateDTO> {

    @Autowired
    private ExternoRepository repository;

    @Override
    public void initialize(ExternoUpdateValid ann) {
    }

    @Override
    public boolean isValid(ExternoUpdateDTO dto, ConstraintValidatorContext context) {

        List<FieldMessage> list = new ArrayList<>();

        // Check if email already exists for another externo
        Optional<Externo> externoWithSameEmail = repository.findByEmail(dto.getEmail());
        if (externoWithSameEmail.isPresent() && !externoWithSameEmail.get().getId().equals(dto.getId())) {
            list.add(new FieldMessage("email", "Email já existe"));
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
