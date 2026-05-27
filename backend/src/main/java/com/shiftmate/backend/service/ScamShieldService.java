package com.shiftmate.backend.service;

import com.shiftmate.backend.model.*;
import com.shiftmate.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ScamShieldService {

        @Autowired
        private ScamReportRepository scamReportRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private JobRepository jobRepository;

        private static final List<String> SCAM_KEYWORDS = List.of(
                        "pay to join", "registration fee", "deposit required",
                        "pay first", "send money", "advance payment",
                        "joining fee", "security deposit", "training fee",
                        "pay rs", "investment required");

        public Map<String, Object> analyzeJob(String title, String description) {
                Map<String, Object> result = new HashMap<>();
                String combined = (title + " " + description).toLowerCase();
                List<String> foundKeywords = SCAM_KEYWORDS.stream()
                                .filter(combined::contains)
                                .toList();
                result.put("isSuspicious", !foundKeywords.isEmpty());
                result.put("flaggedKeywords", foundKeywords);
                result.put("riskLevel", foundKeywords.isEmpty() ? "LOW" : foundKeywords.size() > 2 ? "HIGH" : "MEDIUM");
                return result;
        }

        // verify by employer ID
        public User verifyEmployer(Long employerId,
                        String companyName, String gstNumber,
                        String companyAddress) {
                User employer = userRepository.findById(employerId)
                                .orElseThrow(() -> new RuntimeException("Employer not found!"));
                employer.setCompanyName(companyName);
                employer.setGstNumber(gstNumber);
                employer.setCompanyAddress(companyAddress);
                employer.setEmployerVerified(true);
                return userRepository.save(employer);
        }

        // verify by email (used by JWT auth)
        public User verifyEmployerByEmail(String email,
                        String companyName, String gstNumber,
                        String companyAddress) {
                User employer = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Employer not found!"));
                employer.setCompanyName(companyName);
                employer.setGstNumber(gstNumber);
                employer.setCompanyAddress(companyAddress);
                employer.setEmployerVerified(true);
                return userRepository.save(employer);
        }

        public ScamReport reportScam(
                        Long reporterId, Long jobId,
                        String reason, String description,
                        ScamReport.ReportType type) {

                User reporter = userRepository.findById(reporterId)
                                .orElseThrow(() -> new RuntimeException("Reporter not found!"));
                Job job = jobRepository.findById(jobId)
                                .orElseThrow(() -> new RuntimeException("Job not found!"));

                ScamReport report = new ScamReport();
                report.setReporter(reporter);
                report.setReportedJob(job);
                report.setReportedEmployer(job.getEmployer());
                report.setReason(reason);
                report.setDescription(description);
                report.setType(type);

                User employer = job.getEmployer();
                employer.setReportCount(employer.getReportCount() + 1);
                if (employer.getReportCount() >= 5) {
                        employer.setBanned(true);
                }
                userRepository.save(employer);
                return scamReportRepository.save(report);
        }

        public List<ScamReport> getPendingReports() {
                return scamReportRepository
                                .findByStatus(ScamReport.ReportStatus.PENDING);
        }

        public List<ScamReport> getAllReports() {
                return scamReportRepository.findAll();
        }

        public ScamReport resolveReport(Long reportId,
                        ScamReport.ReportStatus status) {
                ScamReport report = scamReportRepository
                                .findById(reportId)
                                .orElseThrow(() -> new RuntimeException("Report not found!"));
                report.setStatus(status);
                return scamReportRepository.save(report);
        }

        public long getJobReportCount(Long jobId) {
                Job job = jobRepository.findById(jobId)
                                .orElseThrow(() -> new RuntimeException("Job not found!"));
                return scamReportRepository.countByReportedJob(job);
        }

        public List<User> getVerifiedEmployers() {
                return userRepository.findAll().stream()
                                .filter(u -> u.getRole() == User.Role.EMPLOYER
                                                && u.isEmployerVerified())
                                .toList();
        }

        public User banEmployer(Long employerId) {
                User employer = userRepository.findById(employerId)
                                .orElseThrow(() -> new RuntimeException("Employer not found!"));
                employer.setBanned(true);
                return userRepository.save(employer);
        }
}