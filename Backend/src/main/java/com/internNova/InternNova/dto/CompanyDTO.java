package com.internNova.InternNova.dto;

import com.internNova.InternNova.enums.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CompanyDTO {

    private String id;
    private User user;

    @NotBlank
    private String companyName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String companySize;

    @NotBlank
    private String companyDescription;

    @NotNull
    @Min(1800)
    private Integer foundedYear;

    @NotBlank
    private String companyType;

    @NotBlank
    private String websiteUrl;

    @NotBlank
    private String logoUrl;
}
