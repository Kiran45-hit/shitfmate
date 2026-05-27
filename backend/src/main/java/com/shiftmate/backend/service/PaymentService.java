package com.shiftmate.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.shiftmate.backend.model.*;
import com.shiftmate.backend.repository.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    // employer creates payment order for a job
    public Map<String, Object> createJobPaymentOrder(
            Long jobId, String employerEmail) throws Exception {

        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found!"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found!"));

        if (!job.getEmployer().getEmail().equals(employerEmail)) {
            throw new RuntimeException("Not authorized!");
        }

        // total amount = salary x total slots
        double totalAmount = job.getSalary() * job.getTotalSlots();
        double platformFee = totalAmount * 0.10; // 10% commission
        double workerAmount = totalAmount - platformFee;

        // create Razorpay order
        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (totalAmount * 100)); // paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "job_" + jobId);

        Order razorpayOrder = client.orders.create(orderRequest);

        // save payment record
        Payment payment = new Payment();
        payment.setJob(job);
        payment.setEmployer(employer);
        payment.setAmount(totalAmount);
        payment.setPlatformFee(platformFee);
        payment.setWorkerAmount(workerAmount);
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setType(Payment.PaymentType.JOB_PAYMENT);
        paymentRepository.save(payment);

        // return order details to frontend
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", razorpayOrder.get("id"));
        response.put("amount", (int) (totalAmount * 100));
        response.put("currency", "INR");
        response.put("keyId", keyId);
        response.put("jobTitle", job.getTitle());
        response.put("totalAmount", totalAmount);
        response.put("platformFee", platformFee);
        response.put("workerAmount", workerAmount);
        return response;
    }

    // verify payment after employer pays
    public Payment verifyAndCapturePayment(
            String razorpayOrderId,
            String razorpayPaymentId) {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus(Payment.PaymentStatus.CAPTURED);
        return paymentRepository.save(payment);
    }

    // release payment to worker after job completion
    public Payment releasePaymentToWorker(
            Long jobId, String workerEmail) {

        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker not found!"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found!"));

        Payment payment = paymentRepository
                .findByStatus(Payment.PaymentStatus.CAPTURED)
                .stream()
                .filter(p -> p.getJob().getId().equals(jobId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No captured payment found!"));

        payment.setWorker(worker);
        payment.setStatus(Payment.PaymentStatus.RELEASED);
        return paymentRepository.save(payment);
    }

    // get employer payment history
    public List<Payment> getEmployerPayments(String employerEmail) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found!"));
        return paymentRepository.findByEmployer(employer);
    }

    // get worker payment history
    public List<Payment> getWorkerPayments(String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker not found!"));
        return paymentRepository.findByWorker(worker);
    }
}