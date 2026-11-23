package com.minijira.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity // Tells JPA: "Turn this Java class into a database table"
@Table(name = "users") // Names the table "users" (because "user" is a reserved keyword in Postgres)
@Data // Lombok: auto-generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor // Lombok: creates an empty constructor (required by JPA)
@AllArgsConstructor // Lombok: creates a constructor with all fields
@Builder // Lombok: lets us build User objects cleanly like User.builder().email(...).build()
public class User {

    @Id // Marks this field as the Primary Key (unique ID for every row)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Postgres auto-increments the ID (1, 2, 3...)
    private Long id;

    @Column(nullable = false) // Database constraint: cannot be empty/null
    private String name;

    @Column(nullable = false, unique = true) // Cannot be null, and no two users can share an email
    private String email;

    @Column(nullable = false)
    private String password; // Will store the BCrypt hashed password, never plain text
}