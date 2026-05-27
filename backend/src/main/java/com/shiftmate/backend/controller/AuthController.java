package com.shiftmate.backend.controller;

import com.shiftmate.backend.config.JwtUtil;
import com.shiftmate.backend.model.User;
import com.shiftmate.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        return userService.findByEmail(email)
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        String token = jwtUtil.generateToken(
                                user.getEmail(),
                                user.getRole().name());
                        Map<String, Object> response = new HashMap<>();
                        response.put("token", token);
                        response.put("role", user.getRole());
                        response.put("name", user.getName());
                        response.put("email", user.getEmail());
                        response.put("id", user.getId());
                        response.put("phone", user.getPhone());
                        response.put("employerVerified", user.isEmployerVerified());
                        response.put("banned", user.isBanned());
                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.badRequest()
                                .body("Invalid password!");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("User not found!"));
    }
}