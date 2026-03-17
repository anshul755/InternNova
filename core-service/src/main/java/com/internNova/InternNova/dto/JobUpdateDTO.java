package com.internNova.InternNova.dto;

import java.time.LocalDate;
import java.util.List;

import com.internNova.InternNova.enums.OpportunityType;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JobUpdateDTO {

    private String title;
    private String description;
    private String requirements;
    private String responsibilities;
    private List<String> skillsRequired;
    private String location;
    private Boolean remoteOption;

    @PositiveOrZero(message = "Minimum salary must be positive or zero")
    private Double salaryMin;

    @PositiveOrZero(message = "Maximum salary must be positive or zero")
    private Double salaryMax;

    private OpportunityType jobType;
    private String duration;
    private LocalDate startDate;
    private LocalDate applicationDeadline;
    private String status;
    private String selectionCriteria;
}