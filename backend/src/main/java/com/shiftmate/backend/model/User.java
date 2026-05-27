package com.shiftmate.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean verified = false;

    // Scam Shield fields
    private boolean employerVerified = false;
    private String companyName;
    private String gstNumber;
    private String companyAddress;
    private boolean banned = false;
    private int reportCount = 0;

    public enum Role {
        WORKER, EMPLOYER, ADMIN
    }
}