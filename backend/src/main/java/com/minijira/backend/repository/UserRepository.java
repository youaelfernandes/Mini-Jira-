 package com.minijira.backend.repository;

import com.minijira.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// <User, Long> tells Spring: "Manage the User table, whose Primary Key (id) is a Long"
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring reads this method name and auto-writes: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);
}