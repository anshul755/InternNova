package com.internNova.InternNova.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TalentRegistrationDTO extends TalentDTO {
    private String password;
}
