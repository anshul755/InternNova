package com.internNova.InternNova.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApplicationCreateDTO {

    @NotBlank(message = "Job ID is required")
    private String jobId;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    private String motivationStatement;
    private String resumeUrl;
}