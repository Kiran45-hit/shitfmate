package com.shiftmate.backend.service;

import com.shiftmate.backend.model.*;
import com.shiftmate.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class JobService {

    @Autowired
    private ScamShieldService scamShieldService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // employer posts a job
    public Job postJob(Job job, String employerEmail) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found!"));

        if (employer.getRole() != User.Role.EMPLOYER) {
            throw new RuntimeException("Only employers can post jobs!");
        }

        // scam shield check
        Map<String, Object> analysis = scamShieldService
                .analyzeJob(job.getTitle(), job.getDescription());
        if ((boolean) analysis.get("isSuspicious")) {
            throw new RuntimeException(
                    "⚠️ Job flagged by Scam Shield! " +
                            "Remove suspicious keywords: " +
                            analysis.get("flaggedKeywords"));
        }

        // check if employer is banned
        if (employer.isBanned()) {
            throw new RuntimeException(
                    "Your account has been banned. Contact support.");
        }

        job.setEmployer(employer);
        return jobRepository.save(job);
    }

    // get all open jobs
    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus(Job.JobStatus.OPEN);
    }

    // get jobs by location
    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocationContainingIgnoreCase(location);
    }

    // get jobs by type
    public List<Job> getJobsByType(Job.JobType jobType) {
        return jobRepository.findByJobType(jobType);
    }

    // get single job
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found!"));
    }

    // worker applies for job
    public JobApplication applyForJob(Long jobId, String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker not found!"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found!"));

        if (job.getStatus() != Job.JobStatus.OPEN) {
            throw new RuntimeException("Job is not open for applications!");
        }

        if (jobApplicationRepository.existsByWorkerAndJob(worker, job)) {
            throw new RuntimeException("You already applied for this job!");
        }

        if (job.getFilledSlots() >= job.getTotalSlots()) {
            throw new RuntimeException("No slots available!");
        }

        JobApplication application = new JobApplication();
        application.setWorker(worker);
        application.setJob(job);

        // notify employer
        notificationService.notifyJobApplication(
                job.getEmployer(), worker, job.getTitle());

        return jobApplicationRepository.save(application);
    }

    // employer accepts/rejects application
    public JobApplication updateApplicationStatus(
            Long applicationId,
            JobApplication.ApplicationStatus newStatus,
            String employerEmail) {

        JobApplication application = jobApplicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found!"));

        if (!application.getJob().getEmployer().getEmail()
                .equals(employerEmail)) {
            throw new RuntimeException("Not authorized!");
        }

        application.setStatus(newStatus);
        application.setUpdatedAt(LocalDateTime.now());

        // send notification based on status
        if (newStatus == JobApplication.ApplicationStatus.ACCEPTED) {
            notificationService.notifyApplicationAccepted(
                    application.getWorker(),
                    application.getJob().getTitle(),
                    application.getJob().getEmployer().getName());
            // update filled slots
            Job job = application.getJob();
            job.setFilledSlots(job.getFilledSlots() + 1);
            if (job.getFilledSlots() >= job.getTotalSlots()) {
                job.setStatus(Job.JobStatus.CLOSED);
            }
            jobRepository.save(job);
        } else if (newStatus == JobApplication.ApplicationStatus.REJECTED) {
            notificationService.notifyApplicationRejected(
                    application.getWorker(),
                    application.getJob().getTitle());
        }

        return jobApplicationRepository.save(application);
    }

    // get employer's posted jobs
    public List<Job> getEmployerJobs(String employerEmail) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found!"));
        return jobRepository.findByEmployer(employer);
    }

    // get worker's applications
    public List<JobApplication> getWorkerApplications(String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker not found!"));
        return jobApplicationRepository.findByWorker(worker);
    }

    // get all applicants for a job
    public List<JobApplication> getJobApplicants(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found!"));
        return jobApplicationRepository.findByJob(job);
    }
}