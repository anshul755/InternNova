package com.internNova.InternNova.services;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

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

    public List<Company> getAllCompanies() {
        return companyRepository.findByIsDeletedFalse();
    }

    public Company createCompany(CompanyDTO companyDTO, MultipartFile logo) throws IOException {

        Company company = new Company();
        if (companyDTO.getId() != null && !companyDTO.getId().isBlank()) {
            company.setId(companyDTO.getId());
        }
        company.setUser(User.Company);
        updateCompanyFromDTO(companyDTO, company);

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

    public Company updateCompany(String id, CompanyDTO companyDTO, MultipartFile logo)
            throws IOException {
        Company company = getCompany(id);
        if (company.isDeleted()) {
            throw new RuntimeException("Company not found");
        }

        updateCompanyFromDTO(companyDTO, company);

        if (logo != null) {
            if (company.getLogoUrl() != null && !company.getLogoUrl().isBlank()) {
                try {
                    cloudinaryService.deleteFile(company.getLogoUrl());
                } catch (Exception e) {
                    // Ignore deletion errors for old files
                }
            }
            String logoUrl = cloudinaryService.uploadFile(logo);
            company.setLogoUrl(logoUrl);
        }

        return companyRepository.save(company);
    }

    private void updateCompanyFromDTO(CompanyDTO companyDTO, Company company) {
        if (companyDTO.getCompanyName() != null)
            company.setCompanyName(companyDTO.getCompanyName());

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
