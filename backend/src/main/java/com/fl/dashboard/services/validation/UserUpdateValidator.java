package com.fl.dashboard.services.validation;

import com.fl.dashboard.dto.UserUpdateDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.resources.exceptions.FieldMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UserUpdateValidator implements ConstraintValidator<UserUpdateValid, UserUpdateDTO> {

    // Para conseguir obter o código que passamos como argumento na requisição (neste caso o nmro do Id)
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void initialize(UserUpdateValid ann) {
        // TODO document why this method is empty
    }

    @Override
    public boolean isValid(UserUpdateDTO dto, ConstraintValidatorContext context) {

        /*
        Para aceder às variaveis do URl. Depois mapeamos os atributos da URL
        Temos que fazer Cast, pois a inferência de tipos não captou o HandlerMapping
        Usamos então o Map e como tudo é String nos pedidos HTTP (como um jSON) podemos atribuir um conjunto de pares chave-valor,
        neste caso chave: id, valor: o número do mesmo
        */
        @SuppressWarnings("unchecked")
        var uriVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        // Para aceder ao Id
        long userId = Long.parseLong(uriVars.get("id"));

        List<FieldMessage> list = new ArrayList<>();

        // Colocar aqui os testes de validação, acrescentando objetos FieldMessage à lista
        User user = userRepository.findByEmail(dto.getEmail());
        if (user != null && userId != user.getId()) {
            list.add(new FieldMessage("email", "Email já existe! Por favor insira outro email"));
        }

        for (FieldMessage e : list) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(e.getMessage()).addPropertyNode(e.getFieldName())
                    .addConstraintViolation();
        }
        return list.isEmpty();
    }
}

