package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_user")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String funcao;
    private String cargo;

    @Column(unique = true)
    private String email;
    private String password;

    @Lob
    @Column(name = "profile_image", columnDefinition = "MEDIUMBLOB")
    private byte[] profileImage;

    @ManyToMany(mappedBy = "users")
    private Set<Projeto> projetos = new HashSet<>();

    @ManyToMany(mappedBy = "assignedUsers")
    private Set<Tarefa> assignedTarefas;

    public User() {
    }

    public User(Long id, String username, String funcao, String cargo, String email, String password, byte[] profileImage) {
        this.id = id;
        this.username = username;
        this.funcao = funcao;
        this.cargo = cargo;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
