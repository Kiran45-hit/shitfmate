package com.shiftmate.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (Exception e) {
            System.out.println("Email failed: " + e.getMessage());
        }
    }

    public void sendApplicationReceived(String employerEmail,
            String workerName, String jobTitle) {
        sendEmail(
                employerEmail,
                "New Application — " + jobTitle,
                "Hi,\n\n" + workerName +
                        " has applied for your job: " + jobTitle +
                        "\n\nLogin to ShiftMate to review the application." +
                        "\n\nTeam ShiftMate");
    }

    public void sendApplicationAccepted(String workerEmail,
            String jobTitle, String employerName) {
        sendEmail(
                workerEmail,
                "Application Accepted — " + jobTitle,
                "Congratulations!\n\nYour application for " + jobTitle +
                        " by " + employerName + " has been ACCEPTED!" +
                        "\n\nLogin to ShiftMate to view your shift details." +
                        "\n\nTeam ShiftMate");
    }

    public void sendApplicationRejected(String workerEmail,
            String jobTitle) {
        sendEmail(
                workerEmail,
                "Application Update — " + jobTitle,
                "Hi,\n\nUnfortunately your application for " +
                        jobTitle + " was not selected this time." +
                        "\n\nKeep applying — new jobs are posted daily on ShiftMate!" +
                        "\n\nTeam ShiftMate");
    }

    public void sendPaymentReleased(String workerEmail,
            String jobTitle, double amount) {
        sendEmail(
                workerEmail,
                "Payment Released — ₹" + amount,
                "Great news!\n\nPayment of ₹" + amount +
                        " has been released for your completed job: " + jobTitle +
                        "\n\nLogin to ShiftMate to withdraw your earnings." +
                        "\n\nTeam ShiftMate");
    }
}