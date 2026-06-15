package com.internNova.InternNova.entity;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.internNova.InternNova.enums.ApplicationState;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "applications")
@Data
@NoArgsConstructor
public class Application {

    @Id
    private String id;
    private String jobId;
    private String studentId;
    private ApplicationState status = ApplicationState.APPLIED;
    private String motivationStatement;
    private String resumeUrl;
    private Double aiMatchScore;
    private String recruiterNotes;
    private LocalDateTime appliedAt;
    private boolean isDeleted = false;

    private String jobTitle;
    private String companyName;
    private String jobLocation;

    // Structured resume produced by the AI parser step, stored as-is for later use.
    private Map<String, Object> parsedResume;

    // Set when the async AI evaluation fails — lets the frontend show that evaluation
    // needs attention instead of silently staying APPLIED forever.
    private String evaluationError;

    // Timestamp of the last AI evaluation attempt (success or failure).
    private LocalDateTime evaluationAttemptedAt;
}
