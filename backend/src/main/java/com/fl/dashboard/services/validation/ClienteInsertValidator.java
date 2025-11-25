package com.fl.dashboard.services.validation;

import com.fl.dashboard.dto.ClienteInsertDTO;
import com.fl.dashboard.repositories.ClienteRepository;
import com.fl.dashboard.resources.exceptions.FieldMessage;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

public class ClienteInsertValidator implements ConstraintValidator<ClienteInsertValid, ClienteInsertDTO> {

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public void initialize(ClienteInsertValid ann) {
        // Method intentionally left empty
    }

    @Override
    public boolean isValid(ClienteInsertDTO dto, ConstraintValidatorContext context) {
        List<FieldMessage> list = new ArrayList<>();

        // Check if NIF is already in use
        if (dto.getNif() != null && !dto.getNif().isEmpty()) {
            var clienteWithSameNif = clienteRepository.findByNif(dto.getNif());
            if (clienteWithSameNif.isPresent()) {
                list.add(new FieldMessage("nif", "NIF já existe! Por favor verifique o NIF inserido"));
            }
        }

        // Check if numero is already in use
        if (dto.getNumero() != null) {
            var clienteWithSameNumero = clienteRepository.findByNumero(dto.getNumero());
            if (clienteWithSameNumero.isPresent()) {
                list.add(new FieldMessage("numero", "Número já existe! Por favor insira um número único"));
            }
        }

        // Add validation errors to the context
        for (FieldMessage e : list) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(e.getMessage())
                    .addPropertyNode(e.getFieldName())
                    .addConstraintViolation();
        }

        return list.isEmpty();
    }
}
