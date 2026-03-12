package com.internNova.InternNova.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.internNova.InternNova.dto.JobCreateDTO;
import com.internNova.InternNova.dto.JobUpdateDTO;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.enums.OpportunityType;
import com.internNova.InternNova.repository.JobRepository;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(JobCreateDTO jobCreateDTO) {
        Job job = new Job();
        mapCreateDTOToEntity(jobCreateDTO, job);
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findByIsDeletedFalse();
    }

    public Page<Job> getAllJobs(Pageable pageable) {
        return jobRepository.findByIsDeletedFalse(pageable);
    }

    public Optional<Job> getJobById(String id) {
        Optional<Job> job = jobRepository.findByIdAndIsDeletedFalse(id);
        if (job.isPresent()) {
            incrementViewCount(job.get());
        }
        return job;
    }

    public Job getJob(String id) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        incrementViewCount(job);
        return job;
    }

    public List<Job> getJobsByCompany(String companyId) {
        return jobRepository.findByCompanyIdAndIsDeletedFalse(companyId);
    }

    public Page<Job> getJobsByCompany(String companyId, Pageable pageable) {
        return jobRepository.findByCompanyIdAndIsDeletedFalse(companyId, pageable);
    }

    public Page<Job> getJobsByType(OpportunityType jobType, Pageable pageable) {
        return jobRepository.findByJobType(jobType, pageable);
    }

    public Page<Job> getJobsByLocation(String location, Pageable pageable) {
        return jobRepository.findByLocationContainingIgnoreCase(location, pageable);
    }

    public Page<Job> searchJobs(String keyword, Pageable pageable) {
        return jobRepository.searchJobs(keyword, pageable);
    }

    public Job updateJob(String id, JobUpdateDTO jobUpdateDTO) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (job.isDeleted()) {
            throw new RuntimeException("Job not found");
        }

        mapUpdateDTOToEntity(jobUpdateDTO, job);
        return jobRepository.save(job);
    }

    public void deleteJob(String id) {
        Job job = jobRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setDeleted(true);
        jobRepository.save(job);
    }

    public void incrementApplicationCount(String jobId) {
        Optional<Job> optionalJob = jobRepository.findByIdAndIsDeletedFalse(jobId);
        if (optionalJob.isPresent()) {
            Job job = optionalJob.get();
            job.setApplicationsCount(job.getApplicationsCount() + 1);
            jobRepository.save(job);
        }
    }

    public void decrementApplicationCount(String jobId) {
        Optional<Job> optionalJob = jobRepository.findByIdAndIsDeletedFalse(jobId);
        if (optionalJob.isPresent()) {
            Job job = optionalJob.get();
            if (job.getApplicationsCount() > 0) {
                job.setApplicationsCount(job.getApplicationsCount() - 1);
                jobRepository.save(job);
            }
        }
    }

    private void incrementViewCount(Job job) {
        job.setViewsCount(job.getViewsCount() + 1);
        jobRepository.save(job);
    }

    private void mapCreateDTOToEntity(JobCreateDTO dto, Job job) {
        job.setCompanyId(dto.getCompanyId());
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setRequirements(dto.getRequirements());
        job.setResponsibilities(dto.getResponsibilities());
        job.setSkillsRequired(dto.getSkillsRequired());
        job.setLocation(dto.getLocation());
        job.setRemoteOption(dto.getRemoteOption());
        job.setSalaryMin(dto.getSalaryMin());
        job.setSalaryMax(dto.getSalaryMax());
        job.setJobType(dto.getJobType());
        job.setDuration(dto.getDuration());
        job.setStartDate(dto.getStartDate());
        job.setApplicationDeadline(dto.getApplicationDeadline());
    }

    private void mapUpdateDTOToEntity(JobUpdateDTO dto, Job job) {
        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getRequirements() != null) job.setRequirements(dto.getRequirements());
        if (dto.getResponsibilities() != null) job.setResponsibilities(dto.getResponsibilities());
        if (dto.getSkillsRequired() != null) job.setSkillsRequired(dto.getSkillsRequired());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getRemoteOption() != null) job.setRemoteOption(dto.getRemoteOption());
        if (dto.getSalaryMin() != null) job.setSalaryMin(dto.getSalaryMin());
        if (dto.getSalaryMax() != null) job.setSalaryMax(dto.getSalaryMax());
        if (dto.getJobType() != null) job.setJobType(dto.getJobType());
        if (dto.getDuration() != null) job.setDuration(dto.getDuration());
        if (dto.getStartDate() != null) job.setStartDate(dto.getStartDate());
        if (dto.getApplicationDeadline() != null) job.setApplicationDeadline(dto.getApplicationDeadline());
        if (dto.getStatus() != null) job.setStatus(dto.getStatus());
    }
}