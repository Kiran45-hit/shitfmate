package com.shiftmate.backend.controller;

import com.shiftmate.backend.model.Job;
import com.shiftmate.backend.model.JobApplication;
import com.shiftmate.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    // POST /api/jobs — employer posts a job
    @PostMapping
    public ResponseEntity<?> postJob(
            @RequestBody Job job,
            Authentication auth) {
        try {
            Job savedJob = jobService.postJob(job, auth.getName());
            return ResponseEntity.ok(savedJob);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/jobs — get all open jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllOpenJobs());
    }

    // GET /api/jobs/{id} — get single job
    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.getJobById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/jobs/search?location=bangalore
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {
        if (location != null) {
            return ResponseEntity.ok(jobService.getJobsByLocation(location));
        }
        if (type != null) {
            return ResponseEntity.ok(
                    jobService.getJobsByType(Job.JobType.valueOf(type.toUpperCase())));
        }
        return ResponseEntity.ok(jobService.getAllOpenJobs());
    }

    // POST /api/jobs/{id}/apply — worker applies
    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyForJob(
            @PathVariable Long id,
            Authentication auth) {
        try {
            JobApplication application = jobService.applyForJob(id, auth.getName());
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/jobs/applications/{id}/status — employer updates status
    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth) {
        try {
            JobApplication updated = jobService.updateApplicationStatus(
                    id,
                    JobApplication.ApplicationStatus.valueOf(status.toUpperCase()),
                    auth.getName());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/jobs/my-jobs — employer sees their posted jobs
    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(Authentication auth) {
        try {
            return ResponseEntity.ok(jobService.getEmployerJobs(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/jobs/my-applications — worker sees their applications
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(Authentication auth) {
        try {
            return ResponseEntity.ok(
                    jobService.getWorkerApplications(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/jobs/{id}/applicants — employer sees all applicants for a job
    @GetMapping("/{id}/applicants")
    public ResponseEntity<?> getJobApplicants(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Job job = jobService.getJobById(id);
            if (!job.getEmployer().getEmail().equals(auth.getName())) {
                return ResponseEntity.status(403).body("Not authorized!");
            }
            return ResponseEntity.ok(jobService.getJobApplicants(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}