package com.internNova.InternNova.entity;

import java.util.List;

import lombok.Data;

@Data
public class Project {

    private String name;
    private String description;
    private List<String> techStack;
    private String liveUrl;
    private String repoUrl;
    private List<String> highlights;
}
