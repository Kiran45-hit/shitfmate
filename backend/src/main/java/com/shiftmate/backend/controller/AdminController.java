package com.shiftmate.backend.controller;

import com.shiftmate.backend.model.*;
import com.shiftmate.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // check if user is admin
    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // GET /api/admin/users/role?role=WORKER
    @GetMapping("/users/role")
    public ResponseEntity<?> getUsersByRole(
            @RequestParam String role,
            Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> banUser(
            @PathVariable Long id,
            Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        adminService.banUser(id);
        return ResponseEntity.ok("User banned successfully");
    }

    // GET /api/admin/jobs
    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        return ResponseEntity.ok(adminService.getAllJobs());
    }

    // DELETE /api/admin/jobs/{id}
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        adminService.deleteJob(id);
        return ResponseEntity.ok("Job removed successfully");
    }

    // GET /api/admin/payments
    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        return ResponseEntity.ok(adminService.getAllPayments());
    }

    // GET /api/admin/applications
    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body("Admins only!");
        return ResponseEntity.ok(adminService.getAllApplications());
    }
}