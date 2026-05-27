package com.shiftmate.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "scam_reports")
public class ScamReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "reported_job_id")
    private Job reportedJob;

    @ManyToOne
    @JoinColumn(name = "reported_employer_id")
    private User reportedEmployer;

    @Column(nullable = false)
    private String reason;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ReportType type;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ReportStatus {
        PENDING, REVIEWED, RESOLVED, DISMISSED
    }

    public enum ReportType {
        FAKE_JOB, MONEY_REQUIRED, FAKE_EMPLOYER,
        HARASSMENT, PAYMENT_FRAUD, OTHER
    }
}