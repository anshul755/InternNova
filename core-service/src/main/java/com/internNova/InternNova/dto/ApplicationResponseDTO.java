package com.internNova.InternNova.dto;

import java.time.LocalDateTime;

import com.internNova.InternNova.enums.ApplicationState;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApplicationResponseDTO {

    private String id;
    private String jobId;
    private String studentId;
    private ApplicationState status;
    private String motivationStatement;
    private String resumeUrl;
    private Double aiMatchScore;
    private String recruiterNotes;
    private LocalDateTime appliedAt;

    private String jobTitle;
    private String companyName;

    private String studentName;

    // AI evaluation tracking — null = not yet attempted, non-null error = failed.
    private String evaluationError;
    private LocalDateTime evaluationAttemptedAt;
}