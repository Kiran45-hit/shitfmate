package com.shiftmate.backend.repository;

import com.shiftmate.backend.model.Job;
import com.shiftmate.backend.model.JobApplication;
import com.shiftmate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByWorker(User worker);

    List<JobApplication> findByJob(Job job);

    Optional<JobApplication> findByWorkerAndJob(User worker, Job job);

    boolean existsByWorkerAndJob(User worker, Job job);
}