package com.fl.dashboard.services;

import com.fl.dashboard.dto.UserDTO;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        List<User> list = userRepository.findAll();
        return list.stream().map(UserDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User entity = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Utilizador com o id: " + id + " não encontrado"));
        return new UserDTO(entity);
    }

    @Transactional
    public UserDTO insert(UserDTO dto) {
        User entity = new User();
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity = userRepository.save(entity);
        return new UserDTO(entity);
    }

    /* Group employees by department
    Map<Department, List<Employee>> byDept = employees.stream().collect(Collectors.groupingBy(Employee::getDepartment));
    */
}
