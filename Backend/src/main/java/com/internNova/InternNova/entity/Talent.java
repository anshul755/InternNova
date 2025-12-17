package com.internNova.InternNova.entity;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.internNova.InternNova.enums.User;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "talent")
@Data
@NoArgsConstructor
public class Talent {

    @Id
    private String id;
    private User user;
    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;
    private boolean isDeleted = false;
    private String university;
    private String major;
    private String graduationYear;
    private Double cgpa;

    private List<String> skills;

    private String avatarUrl;
    private String resumeUrl;
    private String linkedinUrl;
    private String githubUrl;

    private String portfolioUrl;
    private String bio;
    private String location;

    private List<String> preferredLocations;
    private List<String> preferredIndustries;
}