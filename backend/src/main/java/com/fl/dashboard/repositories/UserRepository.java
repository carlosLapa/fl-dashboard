package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.User;
import com.fl.dashboard.projections.UserDetailsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"roles"})
    User findByEmail(String email);

    // IDs-only + fetch-by-id split avoids Hibernate's "collection fetch + pagination" in-memory
    // pagination (HHH90003004), which loaded the whole User table (with roles joined) into heap
    // before slicing it — same root cause as the earlier Projeto/Tarefa prod OOM. Plain findAll(Pageable)
    // is inherited from JpaRepository (no EntityGraph override) and stays safe for pageable callers
    // that don't need roles eagerly.
    @Query("SELECT u.id FROM User u")
    Page<Long> findAllIds(Pageable pageable);

    @EntityGraph(attributePaths = {"roles"})
    @Query("SELECT u FROM User u WHERE u.id IN :ids")
    List<User> findAllByIdInWithRoles(@Param("ids") List<Long> ids);

    @Query(nativeQuery = true, value = """
            SELECT tb_user.email AS username, tb_user.password, tb_role.id AS roleId, tb_role.authority
            FROM tb_user
            INNER JOIN tb_user_role ON tb_user.id = tb_user_role.user_id
            INNER JOIN tb_role ON tb_role.id = tb_user_role.role_id
            WHERE tb_user.email = :email
            """)
    List<UserDetailsProjection> searchUserAndRolesByEmail(String email);

    @EntityGraph(attributePaths = {"projetos", "roles"})
    @Query("SELECT u FROM User u")
    List<User> findAllWithProjetos();

    @EntityGraph(attributePaths = {"projetos", "roles"})
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithProjetos(@Param("id") Long id);

    @EntityGraph(attributePaths = {"projetos", "roles"})
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE :nameQuery OR LOWER(u.email) LIKE :emailQuery")
    List<User> findByNameLikeIgnoreCaseOrEmailLikeIgnoreCase(
            @Param("nameQuery") String nameQuery,
            @Param("emailQuery") String emailQuery
    );

    @Modifying
    @Query(value = "DELETE FROM tb_tarefa_user WHERE user_id = :userId", nativeQuery = true)
    void deleteTaskUserAssociationsByUserId(@Param("userId") Long userId);

}
