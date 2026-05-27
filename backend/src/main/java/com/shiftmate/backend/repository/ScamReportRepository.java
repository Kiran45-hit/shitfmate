package com.shiftmate.backend.repository;

import com.shiftmate.backend.model.ScamReport;
import com.shiftmate.backend.model.Job;
import com.shiftmate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScamReportRepository
        extends JpaRepository<ScamReport, Long> {
    List<ScamReport> findByReportedJob(Job job);

    List<ScamReport> findByReportedEmployer(User employer);

    List<ScamReport> findByStatus(ScamReport.ReportStatus status);

    long countByReportedJob(Job job);

    long countByReportedEmployer(User employer);
}