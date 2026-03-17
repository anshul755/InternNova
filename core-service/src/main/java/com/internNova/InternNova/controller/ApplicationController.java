package com.internNova.InternNova.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.internNova.InternNova.dto.ApplicationCreateDTO;
import com.internNova.InternNova.dto.ApplicationResponseDTO;
import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.enums.ApplicationState;
import com.internNova.InternNova.services.ApplicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/applications/v1")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createApplicationMultipart(
            @RequestPart("data") String data,
            @RequestPart(value = "resumeFile", required = false) MultipartFile resumeFile) {
        try {
            ApplicationCreateDTO applicationCreateDTO = objectMapper.readValue(data, ApplicationCreateDTO.class);
            Application application = applicationService.createApplication(applicationCreateDTO, resumeFile);
            return ResponseEntity.ok(application);
        } catch (JsonProcessingException e) {
            return ResponseEntity.badRequest().body("Invalid application data format: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── JSON body (tests and clients that don't need to upload a file) ─────────
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createApplicationJson(
            @Valid @RequestBody ApplicationCreateDTO applicationCreateDTO) {
        try {
            Application application = applicationService.createApplication(applicationCreateDTO, null);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsByJob(
            @PathVariable String jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) ApplicationState status) {

        try {
            if (page == -1 && size == -1) {
                // Return all applications without pagination
                List<ApplicationResponseDTO> applications = applicationService.getApplicationsByJob(jobId);

                if (status != null) {
                    applications = applications.stream()
                            .filter(app -> app.getStatus() == status)
                            .toList();
                }

                return ResponseEntity.ok(applications);
            } else {
                // Return paginated results
                Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                        sortBy);
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<ApplicationResponseDTO> applications = applicationService.getApplicationsByJob(jobId, pageable);

                return ResponseEntity.ok(applications);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getApplicationsByStudent(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        try {
            if (page == -1 && size == -1) {
                // Return all applications without pagination
                List<ApplicationResponseDTO> applications = applicationService.getApplicationsByStudent(studentId);
                return ResponseEntity.ok(applications);
            } else {
                // Return paginated results
                Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                        sortBy);
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<ApplicationResponseDTO> applications = applicationService.getApplicationsByStudent(studentId,
                        pageable);

                return ResponseEntity.ok(applications);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponseDTO> getApplication(@PathVariable String id) {
        try {
            ApplicationResponseDTO application = applicationService.getApplicationById(id);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/shortlist")
    public ResponseEntity<Application> shortlistApplication(@PathVariable String id) {
        try {
            Application application = applicationService.shortlistApplication(id);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Application> rejectApplication(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String recruiterNotes = null;
            if (requestBody != null && requestBody.containsKey("recruiterNotes")) {
                recruiterNotes = requestBody.get("recruiterNotes");
            }

            Application application = applicationService.rejectApplication(id, recruiterNotes);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> requestBody) {
        try {
            if (requestBody == null || !requestBody.containsKey("status")) {
                return ResponseEntity.badRequest().build();
            }
            ApplicationState status = ApplicationState.valueOf(requestBody.get("status").toUpperCase());
            String recruiterNotes = requestBody.getOrDefault("recruiterNotes", null);

            Application application = applicationService.updateApplicationStatus(id, status, recruiterNotes);
            return ResponseEntity.ok(application);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<Void> withdrawApplication(@PathVariable String id) {
        try {
            applicationService.withdrawApplication(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        try {
            applicationService.deleteApplication(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats/job/{jobId}")
    public ResponseEntity<Map<String, Object>> getJobApplicationStats(@PathVariable String jobId) {
        try {
            long totalApplications = applicationService.getApplicationCountByJob(jobId);

            Map<String, Object> stats = Map.of(
                    "totalApplications", totalApplications,
                    "appliedApplications",
                    applicationService.getApplicationsByJobAndStatus(jobId, ApplicationState.APPLIED).size(),
                    "shortlistedApplications",
                    applicationService.getApplicationsByJobAndStatus(jobId, ApplicationState.SHORTLISTED).size(),
                    "rejectedApplications",
                    applicationService.getApplicationsByJobAndStatus(jobId, ApplicationState.REJECTED).size());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentApplicationStats(@PathVariable String studentId) {
        try {
            long totalApplications = applicationService.getApplicationCountByStudent(studentId);

            Map<String, Object> stats = Map.of(
                    "totalApplications", totalApplications);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}