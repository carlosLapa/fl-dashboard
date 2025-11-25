package com.fl.dashboard.services.validation;

import com.fl.dashboard.dto.ClienteUpdateDTO;
import com.fl.dashboard.repositories.ClienteRepository;
import com.fl.dashboard.resources.exceptions.FieldMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ClienteUpdateValidator implements ConstraintValidator<ClienteUpdateValid, ClienteUpdateDTO> {

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public void initialize(ClienteUpdateValid ann) {
        // Method intentionally left empty
    }

    @Override
    public boolean isValid(ClienteUpdateDTO dto, ConstraintValidatorContext context) {

        // Get the cliente ID from the URL
        @SuppressWarnings("unchecked")
        Map<String, String> uriVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        Long clienteId = Long.parseLong(uriVars.get("id"));

        List<FieldMessage> list = new ArrayList<>();

        // Check if NIF is already in use by another cliente (if NIF is a unique field)
        if (dto.getNif() != null && !dto.getNif().isEmpty()) {
            var clienteWithSameNif = clienteRepository.findByNif(dto.getNif());
            if (clienteWithSameNif.isPresent() && !clienteWithSameNif.get().getId().equals(clienteId)) {
                list.add(new FieldMessage("nif", "NIF já existe! Por favor verifique o NIF inserido"));
            }
        }

        // Check if numero is already in use by another cliente
        if (dto.getNumero() != null) {
            if (clienteRepository.existsByNumeroAndIdNot(dto.getNumero(), clienteId)) {
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
