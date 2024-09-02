package com.fl.dashboard.entities;

import com.fl.dashboard.enums.RoleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "tb_role")
@Getter
@Setter
@ToString
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String authority;

    @Enumerated(EnumType.STRING)
    @Column(unique = true)
    private RoleType name;

    // Não é necessário efetuar a associação com User, nesta entidade - ver mais tarde o pq
    // @ManyToMany(mappedBy = "roles")
    // private Set<User> users = new HashSet<>();

    public Role() {
    }

    public Role(Long id, String authority) {
        this.id = id;
        this.authority = authority;
    }
}
