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
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

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

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ApplicationEvaluationService applicationEvaluationService;

    public Application createApplication(ApplicationCreateDTO applicationCreateDTO) {
        return createApplication(applicationCreateDTO, null);
    }

    public Application createApplication(ApplicationCreateDTO applicationCreateDTO, MultipartFile resumeFile) {
        if (applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse(
                applicationCreateDTO.getJobId(), applicationCreateDTO.getStudentId())) {
            throw new RuntimeException("Application already exists for this job");
        }

        Job job = jobRepository.findByIdAndIsDeletedFalse(applicationCreateDTO.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!"ACTIVE".equalsIgnoreCase(job.getStatus())) {
            throw new RuntimeException("Job is not accepting applications");
        }

        talentRepository.findById(applicationCreateDTO.getStudentId())
            .orElseThrow(() -> new RuntimeException("Talent not found"));

        Application application = new Application();
        application.setJobId(applicationCreateDTO.getJobId());
        application.setStudentId(applicationCreateDTO.getStudentId());
        application.setMotivationStatement(applicationCreateDTO.getMotivationStatement());


        application.setJobTitle(job.getTitle());
        application.setJobLocation(job.getLocation());
        Optional<Company> company = companyRepository.findById(job.getCompanyId());
        company.ifPresent(c -> application.setCompanyName(c.getCompanyName()));
        
        if (resumeFile != null && !resumeFile.isEmpty()) {
            try {
                String resumeUrl = cloudinaryService.uploadFile(resumeFile);
                application.setResumeUrl(resumeUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload resume file: " + e.getMessage());
            }
        } else {
            application.setResumeUrl(applicationCreateDTO.getResumeUrl());
        }

        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationState.APPLIED);

        Application savedApplication = applicationRepository.save(application);

        jobService.incrementApplicationCount(applicationCreateDTO.getJobId());

        // Run AI screening synchronously so the response already carries the decision.
        // The caller (frontend) sees SHORTLISTED / UNDER_REVIEW / REJECTED immediately;
        // on failure the application stays APPLIED with evaluationError populated.
        Application evaluated = applicationEvaluationService.evaluateSync(savedApplication, job);
        return evaluated;
    }

    public List<ApplicationResponseDTO> getApplicationsByJob(String jobId) {
        List<Application> applications = applicationRepository.findByJobIdAndIsDeletedFalse(jobId);
        return applications.stream()
            .map(app -> convertToResponseDTO(app, false))
            .collect(Collectors.toList());
    }

    public Page<ApplicationResponseDTO> getApplicationsByJob(String jobId, Pageable pageable) {
        Page<Application> applicationPage = applicationRepository.findByJobIdAndIsDeletedFalse(jobId, pageable);
        List<ApplicationResponseDTO> responseDTOs = applicationPage.getContent().stream()
            .map(app -> convertToResponseDTO(app, false))
            .collect(Collectors.toList());
        
        return new PageImpl<>(responseDTOs, pageable, applicationPage.getTotalElements());
    }

    public List<ApplicationResponseDTO> getApplicationsByStudent(String studentId) {
        List<Application> applications = applicationRepository.findByStudentIdAndIsDeletedFalse(studentId);
        return applications.stream()
            .map(app -> convertToResponseDTO(app, true))
            .collect(Collectors.toList());
    }

    public Page<ApplicationResponseDTO> getApplicationsByStudent(String studentId, Pageable pageable) {
        Page<Application> applicationPage = applicationRepository.findByStudentIdAndIsDeletedFalse(studentId, pageable);
        List<ApplicationResponseDTO> responseDTOs = applicationPage.getContent().stream()
            .map(app -> convertToResponseDTO(app, true))
            .collect(Collectors.toList());
        
        return new PageImpl<>(responseDTOs, pageable, applicationPage.getTotalElements());
    }

    public ApplicationResponseDTO getApplicationById(String id, boolean forStudent) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        return convertToResponseDTO(application, forStudent);
    }

    public Application shortlistApplication(String id) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(ApplicationState.SHORTLISTED);
        return applicationRepository.save(application);
    }

    public Application rejectApplication(String id, String recruiterNotes) {
        return updateApplicationStatus(id, ApplicationState.REJECTED, recruiterNotes);
    }

    public Application updateApplicationStatus(String id, ApplicationState status, String recruiterNotes) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(status);
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

    private ApplicationResponseDTO convertToResponseDTO(Application application, boolean forStudent) {
        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(application.getId());
        dto.setJobId(application.getJobId());
        dto.setStudentId(application.getStudentId());
        
        dto.setMotivationStatement(application.getMotivationStatement());
        dto.setResumeUrl(application.getResumeUrl());
        dto.setAiMatchScore(application.getAiMatchScore());
        dto.setRecruiterNotes(application.getRecruiterNotes());
        dto.setAppliedAt(application.getAppliedAt());

        dto.setJobTitle(application.getJobTitle());
        dto.setCompanyName(application.getCompanyName());

        dto.setEvaluationError(application.getEvaluationError());
        dto.setEvaluationAttemptedAt(application.getEvaluationAttemptedAt());

        ApplicationState finalStatus = application.getStatus();

        Optional<Job> job = jobRepository.findByIdAndIsDeletedFalse(application.getJobId());
        if (job.isPresent()) {
            dto.setJobTitle(job.get().getTitle());
            Optional<Company> company = companyRepository.findById(job.get().getCompanyId());
            if (company.isPresent()) {
                dto.setCompanyName(company.get().getCompanyName());
            }

            // Mask all AI/recruiter statuses for students until the company publishes results.
            // Before publish, every application looks like "APPLIED" to the candidate.
            if (forStudent && !job.get().isResultsPublished()) {
                if (finalStatus != ApplicationState.WITHDRAWN) {
                    finalStatus = ApplicationState.APPLIED;
                }
            }
        }

        dto.setStatus(finalStatus);

        Optional<Talent> talent = talentRepository.findById(application.getStudentId());
        if (talent.isPresent()) {
            dto.setStudentName(talent.get().getName());
        }

        return dto;
    }
}