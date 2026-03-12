package com.internNova.InternNova.entity;

import org.springframework.data.annotation.Id;

import org.springframework.data.mongodb.core.mapping.Document;

import com.internNova.InternNova.enums.User;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "company")
@Data
@NoArgsConstructor
public class Company {

    @Id
    private String id;
    private User user;

    private String companyName;
    private String companySize;
    private String companyDescription;
    private Integer foundedYear;
    private String companyType;

    private boolean isDeleted = false;
    private String websiteUrl;
    private String logoUrl;
}
