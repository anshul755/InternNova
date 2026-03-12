package com.internNova.InternNova.dto;

import java.time.LocalDate;
import java.util.List;

import com.internNova.InternNova.enums.OpportunityType;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JobCreateDTO {

    @NotBlank(message = "Company ID is required")
    private String companyId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;
    private String responsibilities;

    @NotEmpty(message = "At least one skill is required")
    private List<String> skillsRequired;

    @NotBlank(message = "Location is required")
    private String location;

    private Boolean remoteOption = false;

    @PositiveOrZero(message = "Minimum salary must be positive or zero")
    private Double salaryMin;

    @PositiveOrZero(message = "Maximum salary must be positive or zero")
    private Double salaryMax;

    @NotNull(message = "Job type is required")
    private OpportunityType jobType;

    private String duration;

    @Future(message = "Start date must be in the future")
    private LocalDate startDate;

    @Future(message = "Application deadline must be in the future")
    private LocalDate applicationDeadline;
}