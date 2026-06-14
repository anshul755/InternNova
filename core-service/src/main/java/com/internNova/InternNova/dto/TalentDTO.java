package com.internNova.InternNova.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import com.internNova.InternNova.entity.Achievement;
import com.internNova.InternNova.entity.Certification;
import com.internNova.InternNova.entity.Experience;
import com.internNova.InternNova.entity.Project;
import com.internNova.InternNova.enums.User;

@Data
@NoArgsConstructor
public class TalentDTO {

    private String id;
    private User user;

    @NotBlank
    private String name;

    @NotBlank
    private String university;

    @NotBlank
    private String major;

    @NotBlank
    private String graduationYear;

    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Double cgpa;

    @NotEmpty
    private List<String> skills;

    private String avatarUrl;
    private String resumeUrl;

    @NotBlank
    private String linkedinUrl;

    @NotBlank
    private String githubUrl;

    private String portfolioUrl;
    private String bio;
    private String location;

    private List<String> preferredLocations;
    private List<String> preferredIndustries;

    private List<Experience> experience;
    private List<Project> projects;
    private List<Certification> certifications;
    private List<Achievement> achievements;
    private String resumeSummary;
}
