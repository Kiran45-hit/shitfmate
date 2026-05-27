package com.shiftmate.backend.controller;

import com.shiftmate.backend.model.Payment;
import com.shiftmate.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // employer creates payment order
    @PostMapping("/create-order/{jobId}")
    public ResponseEntity<?> createOrder(
            @PathVariable Long jobId,
            Authentication auth) {
        try {
            Map<String, Object> order = paymentService.createJobPaymentOrder(jobId, auth.getName());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // verify payment after razorpay callback
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> request) {
        try {
            Payment payment = paymentService.verifyAndCapturePayment(
                    request.get("razorpayOrderId"),
                    request.get("razorpayPaymentId"));
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // release payment to worker
    @PostMapping("/release/{jobId}")
    public ResponseEntity<?> releasePayment(
            @PathVariable Long jobId,
            @RequestParam String workerEmail,
            Authentication auth) {
        try {
            Payment payment = paymentService
                    .releasePaymentToWorker(jobId, workerEmail);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // get employer payment history
    @GetMapping("/employer-history")
    public ResponseEntity<?> getEmployerHistory(Authentication auth) {
        try {
            return ResponseEntity.ok(
                    paymentService.getEmployerPayments(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // get worker payment history
    @GetMapping("/worker-history")
    public ResponseEntity<?> getWorkerHistory(Authentication auth) {
        try {
            return ResponseEntity.ok(
                    paymentService.getWorkerPayments(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}