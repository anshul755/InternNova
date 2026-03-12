package com.internNova.InternNova.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.internNova.InternNova.dto.ApplicationCreateDTO;
import com.internNova.InternNova.dto.ApplicationResponseDTO;
import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.entity.Company;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.enums.ApplicationState;
import com.internNova.InternNova.repository.ApplicationRepository;
import com.internNova.InternNova.repository.CompanyRepository;
import com.internNova.InternNova.repository.JobRepository;
import com.internNova.InternNova.repository.TalentRepository;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private TalentRepository talentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobService jobService;

    public Application createApplication(ApplicationCreateDTO applicationCreateDTO) {
        // Check if application already exists
        if (applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse(
                applicationCreateDTO.getJobId(), applicationCreateDTO.getStudentId())) {
            throw new RuntimeException("Application already exists for this job");
        }

        // Verify job exists
        Job job = jobRepository.findByIdAndIsDeletedFalse(applicationCreateDTO.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

        // Verify talent exists
        Talent talent = talentRepository.findById(applicationCreateDTO.getStudentId())
            .orElseThrow(() -> new RuntimeException("Talent not found"));

        Application application = new Application();
        application.setJobId(applicationCreateDTO.getJobId());
        application.setStudentId(applicationCreateDTO.getStudentId());
        application.setCoverLetter(applicationCreateDTO.getCoverLetter());
        application.setResumeUrl(applicationCreateDTO.getResumeUrl());
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationState.PENDING);

        Application savedApplication = applicationRepository.save(application);
        
        // Increment application count for the job
        jobService.incrementApplicationCount(applicationCreateDTO.getJobId());
        
        return savedApplication;
    }

    public List<ApplicationResponseDTO> getApplicationsByJob(String jobId) {
        List<Application> applications = applicationRepository.findByJobIdAndIsDeletedFalse(jobId);
        return applications.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    public Page<ApplicationResponseDTO> getApplicationsByJob(String jobId, Pageable pageable) {
        Page<Application> applicationPage = applicationRepository.findByJobIdAndIsDeletedFalse(jobId, pageable);
        List<ApplicationResponseDTO> responseDTOs = applicationPage.getContent().stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
        
        return new PageImpl<>(responseDTOs, pageable, applicationPage.getTotalElements());
    }

    public List<ApplicationResponseDTO> getApplicationsByStudent(String studentId) {
        List<Application> applications = applicationRepository.findByStudentIdAndIsDeletedFalse(studentId);
        return applications.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    public Page<ApplicationResponseDTO> getApplicationsByStudent(String studentId, Pageable pageable) {
        Page<Application> applicationPage = applicationRepository.findByStudentIdAndIsDeletedFalse(studentId, pageable);
        List<ApplicationResponseDTO> responseDTOs = applicationPage.getContent().stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
        
        return new PageImpl<>(responseDTOs, pageable, applicationPage.getTotalElements());
    }

    public ApplicationResponseDTO getApplicationById(String id) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        return convertToResponseDTO(application);
    }

    public Application shortlistApplication(String id) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(ApplicationState.SHORTLISTED);
        return applicationRepository.save(application);
    }

    public Application rejectApplication(String id, String recruiterNotes) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(ApplicationState.REJECTED);
        if (recruiterNotes != null && !recruiterNotes.trim().isEmpty()) {
            application.setRecruiterNotes(recruiterNotes);
        }
        return applicationRepository.save(application);
    }

    public void deleteApplication(String id) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setDeleted(true);
        applicationRepository.save(application);
        
        // Decrement application count for the job
        jobService.decrementApplicationCount(application.getJobId());
    }

    public void withdrawApplication(String id) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(ApplicationState.WITHDRAWN);
        applicationRepository.save(application);
    }

    public List<Application> getApplicationsByJobAndStatus(String jobId, ApplicationState status) {
        return applicationRepository.findByJobIdAndStatusAndIsDeletedFalse(jobId, status);
    }

    public long getApplicationCountByJob(String jobId) {
        return applicationRepository.countByJobIdAndIsDeletedFalse(jobId);
    }

    public long getApplicationCountByStudent(String studentId) {
        return applicationRepository.countByStudentIdAndIsDeletedFalse(studentId);
    }

    private ApplicationResponseDTO convertToResponseDTO(Application application) {
        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(application.getId());
        dto.setJobId(application.getJobId());
        dto.setStudentId(application.getStudentId());
        dto.setStatus(application.getStatus());
        dto.setCoverLetter(application.getCoverLetter());
        dto.setResumeUrl(application.getResumeUrl());
        dto.setAiMatchScore(application.getAiMatchScore());
        dto.setRecruiterNotes(application.getRecruiterNotes());
        dto.setAppliedAt(application.getAppliedAt());

        // Add job details
        Optional<Job> job = jobRepository.findByIdAndIsDeletedFalse(application.getJobId());
        if (job.isPresent()) {
            dto.setJobTitle(job.get().getTitle());
            
            // Add company details
            Optional<Company> company = companyRepository.findById(job.get().getCompanyId());
            if (company.isPresent()) {
                dto.setCompanyName(company.get().getCompanyName());
            }
        }

        // Add student details
        Optional<Talent> talent = talentRepository.findById(application.getStudentId());
        if (talent.isPresent()) {
            dto.setStudentName(talent.get().getName());
        }

        return dto;
    }
}