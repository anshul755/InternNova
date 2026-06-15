package com.internNova.InternNova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request body for the AI service's POST /pipeline/v1/evaluate. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluateRequestDTO {

    private String applicationId;
    private String studentId;
    private String jobId;
    private String resumeUrl;
    private JobContextDTO job;
    private ApplicationContextDTO applicationContext;
}
