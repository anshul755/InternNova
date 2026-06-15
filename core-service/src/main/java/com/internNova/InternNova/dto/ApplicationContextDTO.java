package com.internNova.InternNova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Minimal applicant context used only for resume-name mismatch checks. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationContextDTO {

    private String applicantName;
}
