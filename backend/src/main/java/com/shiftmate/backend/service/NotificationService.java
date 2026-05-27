package com.shiftmate.backend.service;

import com.shiftmate.backend.model.*;
import com.shiftmate.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // create in-app notification
    public Notification createNotification(
            User user, String title, String message,
            Notification.NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    // notify employer when worker applies
    public void notifyJobApplication(
            User employer, User worker, String jobTitle) {
        createNotification(
                employer,
                "New Application",
                worker.getName() + " applied for " + jobTitle,
                Notification.NotificationType.JOB_APPLICATION);
        emailService.sendApplicationReceived(
                employer.getEmail(), worker.getName(), jobTitle);
    }

    // notify worker when accepted
    public void notifyApplicationAccepted(
            User worker, String jobTitle, String employerName) {
        createNotification(
                worker,
                "Application Accepted! 🎉",
                "Your application for " + jobTitle + " was accepted!",
                Notification.NotificationType.APPLICATION_ACCEPTED);
        emailService.sendApplicationAccepted(
                worker.getEmail(), jobTitle, employerName);
    }

    // notify worker when rejected
    public void notifyApplicationRejected(
            User worker, String jobTitle) {
        createNotification(
                worker,
                "Application Update",
                "Your application for " + jobTitle + " was not selected",
                Notification.NotificationType.APPLICATION_REJECTED);
        emailService.sendApplicationRejected(
                worker.getEmail(), jobTitle);
    }

    // notify worker when payment released
    public void notifyPaymentReleased(
            User worker, String jobTitle, double amount) {
        createNotification(
                worker,
                "Payment Released 💰",
                "₹" + amount + " released for " + jobTitle,
                Notification.NotificationType.PAYMENT_RELEASED);
        emailService.sendPaymentReleased(
                worker.getEmail(), jobTitle, amount);
    }

    // get all notifications for a user
    public List<Notification> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    // get unread count
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return notificationRepository
                .countByUserAndIsReadFalse(user);
    }

    // mark all as read
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        List<Notification> unread = notificationRepository
                .findByUserAndIsReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}