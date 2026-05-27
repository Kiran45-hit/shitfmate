package com.shiftmate.backend.repository;

import com.shiftmate.backend.model.Payment;
import com.shiftmate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByEmployer(User employer);

    List<Payment> findByWorker(User worker);

    Optional<Payment> findByRazorpayOrderId(String orderId);

    List<Payment> findByStatus(Payment.PaymentStatus status);
}