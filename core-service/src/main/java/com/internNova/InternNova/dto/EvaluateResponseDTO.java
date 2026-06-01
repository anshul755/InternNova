package com.internNova.InternNova.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response from the AI service's POST /pipeline/v1/evaluate.
 *
 * {@code decision} is one of REJECTED / UNDER_REVIEW / SHORTLISTED (maps to
 * {@code ApplicationState}). {@code resume} is the structured parse, persisted as-is.
 * The fraud fields arrive snake_cased from the Python service.
 */
@Data
@NoArgsConstructor
public class EvaluateResponseDTO {

    private String applicationId;
    private String studentId;
    private String jobId;

    @JsonProperty("is_fake")
    private boolean fake;

    @JsonProperty("fake_confidence")
    private double fakeConfidence;

    @JsonProperty("fake_reasons")
    private List<String> fakeReasons;

    private String decision;
    private double matchScore;
    private List<String> reasons;

    private Map<String, Object> resume;
}
