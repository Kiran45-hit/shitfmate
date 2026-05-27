package com.shiftmate.backend.service;

import com.shiftmate.backend.model.*;
import com.shiftmate.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // get platform stats
    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalWorkers = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.WORKER)
                .count();
        long totalEmployers = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.EMPLOYER)
                .count();
        long totalJobs = jobRepository.count();
        long openJobs = jobRepository
                .findByStatus(Job.JobStatus.OPEN).size();
        long totalApplications = jobApplicationRepository.count();
        long totalPayments = paymentRepository.count();

        double totalRevenue = paymentRepository.findAll()
                .stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.CAPTURED
                        || p.getStatus() == Payment.PaymentStatus.RELEASED)
                .mapToDouble(Payment::getPlatformFee)
                .sum();

        stats.put("totalUsers", totalUsers);
        stats.put("totalWorkers", totalWorkers);
        stats.put("totalEmployers", totalEmployers);
        stats.put("totalJobs", totalJobs);
        stats.put("openJobs", openJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("totalPayments", totalPayments);
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }

    // get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // get all jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // get all payments
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // get all applications
    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    // ban user (delete)
    public void banUser(Long userId) {
        userRepository.deleteById(userId);
    }

    // delete job
    public void deleteJob(Long jobId) {
        jobRepository.deleteById(jobId);
    }

    // get users by role
    public List<User> getUsersByRole(String role) {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole().name().equals(role.toUpperCase()))
                .toList();
    }
}