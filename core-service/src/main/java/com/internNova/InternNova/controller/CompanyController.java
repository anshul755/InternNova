package com.internNova.InternNova.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import com.internNova.InternNova.dto.CompanyDTO;
import com.internNova.InternNova.entity.Company;
import com.internNova.InternNova.services.CompanyService;

@RestController
@RequestMapping("/company/v1")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping
    public ResponseEntity<Company> createCompany(
            @RequestPart("data") CompanyDTO companyDTO,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        try {
            Company company = companyService.createCompany(companyDTO, logo);
            return ResponseEntity.ok(company);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompany(@PathVariable String id) {
        try {
            return ResponseEntity.ok(companyService.getCompany(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(
            @PathVariable String id,
            @RequestPart("data") CompanyDTO companyDTO,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        try {
            Company company = companyService.updateCompany(id, companyDTO, logo);
            return ResponseEntity.ok(company);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        try {
            companyService.deleteCompany(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
