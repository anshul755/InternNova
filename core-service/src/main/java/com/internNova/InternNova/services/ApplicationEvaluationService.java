package com.internNova.InternNova.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.internNova.InternNova.client.AiPipelineClient;
import com.internNova.InternNova.dto.EvaluateRequestDTO;
import com.internNova.InternNova.dto.EvaluateResponseDTO;
import com.internNova.InternNova.dto.JobContextDTO;
import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.enums.ApplicationState;
import com.internNova.InternNova.repository.ApplicationRepository;

/**
 * Runs the AI pipeline for a freshly submitted application off the request thread.
 *
 * The application is already saved as APPLIED before this is called; here we ask the
 * AI service for a decision and write the result (status, match score, reasons, parsed
 * resume) back onto the same document. On any failure we leave the application at
 * APPLIED so a transient AI outage never blocks or breaks an application.
 *
 * Lives in its own bean (not ApplicationService) so Spring's {@code @Async} proxy
 * actually takes effect — a self-invoked @Async method would run synchronously.
 */
@Service
public class ApplicationEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationEvaluationService.class);

    @Autowired
    private AiPipelineClient aiPipelineClient;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Async
    public void evaluate(Application application, Job job) {
        if (application.getResumeUrl() == null || application.getResumeUrl().isBlank()) {
            log.info("Skipping AI evaluation for application {} - no resume URL", application.getId());
            return;
        }

        try {
            JobContextDTO jobContext = new JobContextDTO(
                    job.getTitle(),
                    job.getDescription(),
                    job.getRequirements(),
                    job.getResponsibilities(),
                    job.getSkillsRequired(),
                    job.getLocation(),
                    job.getRemoteOption(),
                    job.getJobType() != null ? job.getJobType().name() : null,
                    job.getDuration(),
                    job.getSelectionCriteria());

            EvaluateRequestDTO request = new EvaluateRequestDTO(
                    application.getId(),
                    application.getStudentId(),
                    application.getJobId(),
                    application.getResumeUrl(),
                    jobContext);

            EvaluateResponseDTO result = aiPipelineClient.evaluate(request);

            // Re-read in case the document changed since the request thread saved it.
            Application fresh = applicationRepository.findByIdAndIsDeletedFalse(application.getId())
                    .orElse(application);

            fresh.setStatus(ApplicationState.valueOf(result.getDecision()));
            fresh.setAiMatchScore(result.getMatchScore());
            if (result.getReasons() != null && !result.getReasons().isEmpty()) {
                fresh.setRecruiterNotes(String.join("\n", result.getReasons()));
            }
            fresh.setParsedResume(result.getResume());
            applicationRepository.save(fresh);

            log.info("AI evaluation for application {} -> {} (matchScore {})",
                    fresh.getId(), result.getDecision(), result.getMatchScore());
        } catch (Exception e) {
            log.error("AI evaluation failed for application {} - leaving status APPLIED: {}",
                    application.getId(), e.getMessage());
        }
    }
}
