package com.shiftmate.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private User employer;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double platformFee;

    @Column(nullable = false)
    private Double workerAmount;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentType type;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentStatus {
        PENDING, CAPTURED, RELEASED, FAILED, REFUNDED
    }

    public enum PaymentType {
        JOB_PAYMENT, WORKER_PAYOUT, REFUND
    }
}