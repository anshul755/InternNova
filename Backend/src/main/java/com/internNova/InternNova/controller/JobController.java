package com.internNova.InternNova.controller;

import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RestController;

import com.internNova.InternNova.dto.JobCreateDTO;
import com.internNova.InternNova.dto.JobUpdateDTO;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.enums.OpportunityType;
import com.internNova.InternNova.services.JobService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/jobs/v1")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobCreateDTO jobCreateDTO) {
        try {
            Job job = jobService.createJob(jobCreateDTO);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) OpportunityType jobType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        
        try {
            Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Job> jobs;
            
            if (search != null && !search.trim().isEmpty()) {
                jobs = jobService.searchJobs(search.trim(), pageable);
            } else if (companyId != null) {
                jobs = jobService.getJobsByCompany(companyId, pageable);
            } else if (jobType != null) {
                jobs = jobService.getJobsByType(jobType, pageable);
            } else if (location != null && !location.trim().isEmpty()) {
                jobs = jobService.getJobsByLocation(location.trim(), pageable);
            } else {
                jobs = jobService.getAllJobs(pageable);
            }
            
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable String id) {
        try {
            Optional<Job> job = jobService.getJobById(id);
            return job.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable String id,
            @Valid @RequestBody JobUpdateDTO jobUpdateDTO) {
        try {
            Job updatedJob = jobService.updateJob(id, jobUpdateDTO);
            return ResponseEntity.ok(updatedJob);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Job>> getJobsByCompany(@PathVariable String companyId) {
        try {
            List<Job> jobs = jobService.getJobsByCompany(companyId);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}