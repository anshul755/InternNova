package com.internNova.InternNova.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.internNova.InternNova.enums.ApplicationState;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "applications")
@Data
@NoArgsConstructor
public class Application {

    @Id
    private String id;
    private String jobId;
    private String studentId;
    private ApplicationState status = ApplicationState.APPLIED;
    private String coverLetter;
    private String resumeUrl;
    private Double aiMatchScore;
    private String recruiterNotes;
    private LocalDateTime appliedAt;
    private boolean isDeleted = false;

    private String jobTitle;
    private String companyName;
    private String jobLocation;
}
