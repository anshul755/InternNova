package com.internNova.InternNova.services;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.internNova.InternNova.client.AiPipelineClient;
import com.internNova.InternNova.dto.ApplicationContextDTO;
import com.internNova.InternNova.dto.EvaluateRequestDTO;
import com.internNova.InternNova.dto.EvaluateResponseDTO;
import com.internNova.InternNova.dto.JobContextDTO;
import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.enums.ApplicationState;
import com.internNova.InternNova.repository.ApplicationRepository;
import com.internNova.InternNova.repository.TalentRepository;

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

    @Autowired
    private TalentRepository talentRepository;

    @Async("applicationEvaluationExecutor")
    public void evaluate(Application application, Job job) {
        evaluateInternal(application, job);
    }

    /**
     * Synchronous version — called from {@link ApplicationService#createApplication}
     * so the HTTP response already carries the AI decision. Runs on the request thread;
     * the caller is responsible for ensuring the client can tolerate the extra latency
     * (typically 5-30 s for download + parse + LLM).
     *
     * @return the updated (and re-saved) application, or the original if evaluation fails.
     */
    public Application evaluateSync(Application application, Job job) {
        evaluateInternal(application, job);
        // Re-read to return the latest persisted state.
        return applicationRepository.findByIdAndIsDeletedFalse(application.getId())
                .orElse(application);
    }

    private void evaluateInternal(Application application, Job job) {
        final String appId = application.getId();
        log.info("AI evaluation starting for application {}", appId);

        if (application.getResumeUrl() == null || application.getResumeUrl().isBlank()) {
            log.info("Skipping AI evaluation for application {} - no resume URL", appId);
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
                    appId,
                    application.getStudentId(),
                    application.getJobId(),
                    application.getResumeUrl(),
                    jobContext,
                    buildApplicationContext(application.getStudentId()));

            log.info("Calling AI service /pipeline/v1/evaluate for application {}", appId);
            EvaluateResponseDTO result = aiPipelineClient.evaluate(request);
            log.info("AI service responded for application {}: decision={}, matchScore={}",
                    appId, result.getDecision(), result.getMatchScore());

            // Re-read in case the document changed since the request thread saved it.
            Application fresh = applicationRepository.findByIdAndIsDeletedFalse(appId)
                    .orElse(application);

            fresh.setStatus(ApplicationState.valueOf(result.getDecision()));
            fresh.setAiMatchScore(result.getMatchScore());
            if (result.getReasons() != null && !result.getReasons().isEmpty()) {
                fresh.setRecruiterNotes(String.join("\n", result.getReasons()));
            }
            fresh.setParsedResume(result.getResume());
            fresh.setEvaluationError(null);              // clear any previous error
            fresh.setEvaluationAttemptedAt(LocalDateTime.now());
            applicationRepository.save(fresh);

            log.info("AI evaluation for application {} -> {} (matchScore {})",
                    fresh.getId(), result.getDecision(), result.getMatchScore());
        } catch (Exception e) {
            log.error("AI evaluation failed for application {}: {}",
                    appId, e.getMessage(), e);

            // Persist the failure so the frontend can surface it.
            try {
                Application fresh = applicationRepository.findByIdAndIsDeletedFalse(appId)
                        .orElse(application);
                if (isResumeExtractionFailure(e)) {
                    fresh.setStatus(ApplicationState.UNDER_REVIEW);
                    fresh.setRecruiterNotes("AI could not parse the resume automatically. "
                            + "The uploaded file may be scanned or image-only, so this application needs manual review.");
                    fresh.setEvaluationError(null);
                    fresh.setEvaluationAttemptedAt(LocalDateTime.now());
                    applicationRepository.save(fresh);
                    log.info("Application {} moved to UNDER_REVIEW because resume text extraction failed", appId);
                    return;
                }
                fresh.setEvaluationError(truncate(e.getMessage(), 500));
                fresh.setEvaluationAttemptedAt(LocalDateTime.now());
                applicationRepository.save(fresh);
            } catch (Exception dbEx) {
                log.error("Failed to persist evaluation error for application {}: {}",
                        appId, dbEx.getMessage());
            }
        }
    }

    private static String truncate(String s, int maxLen) {
        if (s == null) return null;
        return s.length() <= maxLen ? s : s.substring(0, maxLen - 3) + "...";
    }

    private ApplicationContextDTO buildApplicationContext(String studentId) {
        Talent talent = talentRepository.findById(studentId).orElse(null);
        return new ApplicationContextDTO(talent != null ? talent.getName() : null);
    }

    private static boolean isResumeExtractionFailure(Exception e) {
        String message = e.getMessage();
        if (message == null) return false;
        String normalised = message.toLowerCase();
        return normalised.contains("extracted text is empty")
                || normalised.contains("scanned/image-only")
                || normalised.contains("url did not return a pdf")
                || normalised.contains("failed to read pdf");
    }
}
