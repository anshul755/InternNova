package com.internNova.InternNova.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.internNova.InternNova.enums.OpportunityType;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "jobs")
@Data
@NoArgsConstructor
public class Job {

    @Id
    private String id;
    private String companyId;
    private String title;
    private String description;
    private String requirements;
    private String responsibilities;
    private List<String> skillsRequired;
    private String location;
    private Boolean remoteOption = false;
    private Double salaryMin;
    private Double salaryMax;
    private OpportunityType jobType;
    private String duration;
    private LocalDate startDate;
    private LocalDate applicationDeadline;
    private String status = "ACTIVE";
    private Long viewsCount = 0L;
    private Set<String> viewedByUsers = new HashSet<>();
    private Long applicationsCount = 0L;
    private LocalDateTime createdAt;
    private boolean isDeleted = false;

    private String selectionCriteria;
    
    private boolean resultsPublished = false;
}