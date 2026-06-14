package com.internNova.InternNova.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "authUsers")
@Data
@NoArgsConstructor
public class AuthUser {

    @Id
    private String id;
    
    private String email;
}
