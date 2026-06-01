package com.internNova.InternNova.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The subset of {@code Job} fields sent to the AI service so the shortlist LLM can
 * compare a resume against the role. Field names mirror the AI service's JobContext.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobContextDTO {

    private String title;
    private String description;
    private String requirements;
    private String responsibilities;
    private List<String> skillsRequired;
    private String location;
    private Boolean remoteOption;
    private String jobType;
    private String duration;
    private String selectionCriteria;
}
