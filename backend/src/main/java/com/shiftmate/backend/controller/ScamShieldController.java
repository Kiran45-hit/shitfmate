package com.shiftmate.backend.controller;

import com.shiftmate.backend.model.ScamReport;
import com.shiftmate.backend.service.ScamShieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/scam-shield")
@CrossOrigin(origins = "*")
public class ScamShieldController {

    @Autowired
    private ScamShieldService scamShieldService;

    // analyze job for scam keywords
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeJob(
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(scamShieldService.analyzeJob(
                request.get("title"),
                request.get("description")));
    }

    // employer verifies account using JWT email
    @PostMapping("/verify-employer")
    public ResponseEntity<?> verifyEmployer(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(scamShieldService.verifyEmployerByEmail(
                    auth.getName(),
                    request.get("companyName"),
                    request.get("gstNumber"),
                    request.get("companyAddress")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // report a scam
    @PostMapping("/report")
    public ResponseEntity<?> reportScam(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            Long reporterId = Long.parseLong(request.get("reporterId"));
            Long jobId = Long.parseLong(request.get("jobId"));
            ScamReport report = scamShieldService.reportScam(
                    reporterId, jobId,
                    request.get("reason"),
                    request.get("description"),
                    ScamReport.ReportType.valueOf(
                            request.get("type").toUpperCase()));
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // get job report count
    @GetMapping("/report-count/{jobId}")
    public ResponseEntity<?> getReportCount(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(Map.of("count",
                scamShieldService.getJobReportCount(jobId)));
    }

    // admin — get all pending reports
    @GetMapping("/reports/pending")
    public ResponseEntity<?> getPendingReports(Authentication auth) {
        return ResponseEntity.ok(scamShieldService.getPendingReports());
    }

    // admin — get all reports
    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports(Authentication auth) {
        return ResponseEntity.ok(scamShieldService.getAllReports());
    }

    // admin — resolve report
    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth) {
        try {
            ScamReport resolved = scamShieldService.resolveReport(
                    id,
                    ScamReport.ReportStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(resolved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // admin — ban employer
    @PutMapping("/ban-employer/{id}")
    public ResponseEntity<?> banEmployer(
            @PathVariable Long id,
            Authentication auth) {
        try {
            return ResponseEntity.ok(scamShieldService.banEmployer(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}