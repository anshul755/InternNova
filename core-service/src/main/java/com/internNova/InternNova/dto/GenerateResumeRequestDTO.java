package com.internNova.InternNova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body core-service sends to the AI service's
 * POST /pipeline/v1/generate-resume. Field names match the Python
 * {@code GenerateResumeInput} (camelCase) so they map 1:1.
 *
 * {@code talentId} is always set from the authenticated user server-side — any
 * value supplied by the client is overwritten.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateResumeRequestDTO {

    private String talentId;
    private String template;       // "classic" | "modern"
    private String email;          // not stored on Talent; supplied by the caller
    private String phone;
    private String jobTitle;       // optional — enables job-description tailoring
    private String jobDescription;
}
