package com.fl.dashboard.resources;

import com.fl.dashboard.entities.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/users")
public class UserResource {
    
    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        List<User> list = new ArrayList<>();
        list.add(new User(1L, "Carlos", "Lapa", "carlos@gmail.com", "1234"));
        list.add(new User(2L, "José", "Lapa", "jose@gmail.com", "1234"));
        return ResponseEntity.ok().body(list);
    }

}
