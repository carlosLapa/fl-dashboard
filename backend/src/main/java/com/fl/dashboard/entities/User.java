package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Objects;

@Entity
@Table(name = "tb_user")
@Getter
@Setter
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String funcao;
    private String cargo;

    @Column(unique = true)
    private String email;
    private String password;

    @Lob
    @Column(name = "profile_image", columnDefinition = "MEDIUMBLOB")
    private byte[] profileImage;

    public User() {
    }

    public User(Long id, String firstName, String lastName, String funcao, String cargo, String email, String password, byte[] profileImage) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
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
