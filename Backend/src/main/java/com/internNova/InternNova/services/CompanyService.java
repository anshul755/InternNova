package com.internNova.InternNova.services;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.internNova.InternNova.dto.CompanyDTO;
import com.internNova.InternNova.entity.Company;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.CompanyRepository;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Company> getAllCompanies() {
        return companyRepository.findByIsDeletedFalse();
    }

    public Company createCompany(CompanyDTO companyDTO, String password, MultipartFile logo) throws IOException {

        if (companyRepository.findByEmail(companyDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Company company = new Company();
        company.setUser(User.Company);
        updateCompanyFromDTO(companyDTO, company);

        if (password != null && !password.isEmpty()) {
            company.setPassword(passwordEncoder.encode(password));
        } else {
            throw new RuntimeException("Password is required");
        }

        if (logo != null) {
            String logoUrl = cloudinaryService.uploadFile(logo);
            company.setLogoUrl(logoUrl);
        }

        return companyRepository.save(company);
    }

    public Company getCompany(String id) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new RuntimeException("Company not found"));
        if (company.isDeleted()) {
            throw new RuntimeException("Company not found");
        }
        return company;
    }

    public void deleteCompany(String id) {
        Company company = getCompany(id);
        company.setDeleted(true);
        companyRepository.save(company);
    }

    public Company updateCompany(String id, CompanyDTO companyDTO, String password, MultipartFile logo)
            throws IOException {
        Company company = getCompany(id);
        if (company.isDeleted()) {
            throw new RuntimeException("Company not found");
        }

        if (logo != null) {
            if (company.getLogoUrl() != null) {
                cloudinaryService.deleteFile(company.getLogoUrl());
            }
            String logoUrl = cloudinaryService.uploadFile(logo);
            company.setLogoUrl(logoUrl);
        }

        updateCompanyFromDTO(companyDTO, company);

        if (password != null && !password.isEmpty()) {
            company.setPassword(passwordEncoder.encode(password));
        }

        return companyRepository.save(company);
    }

    private void updateCompanyFromDTO(CompanyDTO companyDTO, Company company) {
        if (companyDTO.getCompanyName() != null)
            company.setCompanyName(companyDTO.getCompanyName());
        if (companyDTO.getEmail() != null)
            company.setEmail(companyDTO.getEmail());
        if (companyDTO.getUser() != null)
            company.setUser(companyDTO.getUser());
        if (companyDTO.getCompanySize() != null)
            company.setCompanySize(companyDTO.getCompanySize());
        if (companyDTO.getCompanyDescription() != null)
            company.setCompanyDescription(companyDTO.getCompanyDescription());
        if (companyDTO.getFoundedYear() != null)
            company.setFoundedYear(companyDTO.getFoundedYear());
        if (companyDTO.getCompanyType() != null)
            company.setCompanyType(companyDTO.getCompanyType());
        if (companyDTO.getWebsiteUrl() != null)
            company.setWebsiteUrl(companyDTO.getWebsiteUrl());
        if (companyDTO.getLogoUrl() != null)
            company.setLogoUrl(companyDTO.getLogoUrl());
    }
}
