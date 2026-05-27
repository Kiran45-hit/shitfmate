package com.shiftmate.backend.repository;

import com.shiftmate.backend.model.Notification;
import com.shiftmate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndIsReadFalse(User user);

    long countByUserAndIsReadFalse(User user);
}