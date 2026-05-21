package com.shiftmate.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Double salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftType shiftType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.OPEN;

    @Column(nullable = false)
    private Integer totalSlots;

    @Column(nullable = false)
    private Integer filledSlots = 0;

    @Column(nullable = false)
    private LocalDateTime shiftStartTime;

    @Column(nullable = false)
    private LocalDateTime shiftEndTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // employer who posted this job
    @ManyToOne
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    public enum JobType {
        DELIVERY, AUDIT, SURVEY, EVENT, WAREHOUSE,
        DATA_ENTRY, SCANNING, TECH, PHYSICAL, OTHER
    }

    public enum ShiftType {
        MORNING, EVENING, NIGHT, WEEKEND, FLEXIBLE
    }

    public enum JobStatus {
        OPEN, CLOSED, COMPLETED, CANCELLED
    }
}