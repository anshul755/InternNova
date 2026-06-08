package com.internNova.InternNova.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response from the AI service's POST /pipeline/v1/generate-resume: the raw LaTeX
 * source plus the compiled PDF as a base64 string. Passed straight through to the
 * frontend, which decodes {@code pdfBase64} into a downloadable Blob.
 */
@Data
@NoArgsConstructor
public class GenerateResumeResponseDTO {

    private String talentId;
    private String template;
    private boolean tailored;
    private String tex;
    private String pdfBase64;
}
