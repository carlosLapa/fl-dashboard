package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.projetos")
    List<User> findAllWithProjetos();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.projetos WHERE u.id = :id")
    Optional<User> findByIdWithProjetos(@Param("id") Long id);

}
