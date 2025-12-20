package com.internNova.InternNova.dto;

import lombok.EqualsAndHashCode;

import lombok.Data;

@Data
@EqualsAndHashCode(callSuper = true)
public class CompanyRegistrationDTO extends CompanyDTO {
    private String password;
}
