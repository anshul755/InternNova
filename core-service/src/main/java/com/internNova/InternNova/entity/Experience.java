package com.internNova.InternNova.entity;

import java.util.List;

import lombok.Data;

@Data
public class Experience {

    private String company;
    private String role;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean isCurrent;
    private List<String> bulletPoints;
}
