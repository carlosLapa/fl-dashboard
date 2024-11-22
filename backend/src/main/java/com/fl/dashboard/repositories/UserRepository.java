package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.User;
import com.fl.dashboard.projections.UserDetailsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    @Query(nativeQuery = true, value = """
            SELECT tb_user.email AS username, tb_user.password, tb_role.id AS roleId, tb_role.authority
            FROM tb_user
            INNER JOIN tb_user_role ON tb_user.id = tb_user_role.user_id
            INNER JOIN tb_role ON tb_role.id = tb_user_role.role_id
            WHERE tb_user.email = :email
            """)
    List<UserDetailsProjection> searchUserAndRolesByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.projetos")
    List<User> findAllWithProjetos();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.projetos WHERE u.id = :id")
    Optional<User> findByIdWithProjetos(@Param("id") Long id);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE :nameQuery OR LOWER(u.email) LIKE :emailQuery")
    List<User> findByNameLikeIgnoreCaseOrEmailLikeIgnoreCase(
            @Param("nameQuery") String nameQuery,
            @Param("emailQuery") String emailQuery
    );

}
