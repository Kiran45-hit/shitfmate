package com.shiftmate.backend.repository;

import com.shiftmate.backend.model.Job;
import com.shiftmate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(Job.JobStatus status);

    List<Job> findByEmployer(User employer);

    List<Job> findByJobType(Job.JobType jobType);

    List<Job> findByLocationContainingIgnoreCase(String location);

    List<Job> findByStatusAndJobType(Job.JobStatus status, Job.JobType jobType);
}