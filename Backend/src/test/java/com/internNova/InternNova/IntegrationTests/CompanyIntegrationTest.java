package com.internNova.InternNova.IntegrationTests;

import com.internNova.InternNova.dto.CompanyDTO;
import com.internNova.InternNova.entity.Company;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.CompanyRepository;
import com.internNova.InternNova.services.CompanyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class CompanyIntegrationTest {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CompanyRepository companyRepository;

    private CompanyDTO createCompanyDTO(String email, String name) {
        CompanyDTO dto = new CompanyDTO();
        dto.setCompanyName(name);
        dto.setEmail(email);
        dto.setUser(User.Company);
        dto.setCompanySize("50-100");
        dto.setCompanyDescription("A great tech company");
        dto.setFoundedYear(2020);
        dto.setCompanyType("Product");
        dto.setWebsiteUrl("https://" + name.toLowerCase().replaceAll(" ", "") + ".com");
        dto.setLogoUrl("https://cloudinary.com/logos/" + name);
        return dto;
    }

    private Company getOrCreateCompany(String email, String name) {
        return companyRepository.findByEmail(email).orElseGet(() -> {
            try {
                return companyService.createCompany(createCompanyDTO(email, name), "password123", null);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void testCreateCompany() throws IOException {
        String email = "c1@test.com";
        if (companyRepository.findByEmail(email).isEmpty()) {
            CompanyDTO dto = createCompanyDTO(email, "Tech Corp");
            Company created = companyService.createCompany(dto, "SecurePass!23", null);

            assertThat(created.getId()).isNotNull();
            assertThat(created.getEmail()).isEqualTo(email);
            assertThat(created.getCompanyName()).isEqualTo("Tech Corp");
        }
    }

    @Test
    void testCreateDuplicateEmail() throws IOException {
        String email = "dup_company@test.com";
        getOrCreateCompany(email, "Duplicate Corp");

        assertThat(companyRepository.findByEmail(email)).isPresent();

        CompanyDTO dto2 = createCompanyDTO(email, "Duplicate Corp 2");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            companyService.createCompany(dto2, "NewPass123", null);
        });

        assertThat(exception.getMessage()).isEqualTo("Email already in use");
    }

    @Test
    void testGetCompany() {
        Company created = getOrCreateCompany("get_comp@test.com", "Get Corp");

        Company retrieved = companyService.getCompany(created.getId());
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getId()).isEqualTo(created.getId());
        assertThat(retrieved.getEmail()).isEqualTo("get_comp@test.com");
    }

    @Test
    void testGetAllCompanies() {
        getOrCreateCompany("list1@test.com", "List Corp 1");
        getOrCreateCompany("list2@test.com", "List Corp 2");

        List<Company> companies = companyService.getAllCompanies();
        assertThat(companies).isNotEmpty();
        assertThat(companies.size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void testUpdateCompany() throws IOException {
        Company created = getOrCreateCompany("list2@test.com", "Updated List Corp 2");

        if (created.isDeleted()) {
            created.setDeleted(false);
            companyRepository.save(created);
        }

        CompanyDTO updateDto = new CompanyDTO();
        updateDto.setCompanyName("List Corp 2");

        Company updated = companyService.updateCompany(created.getId(), updateDto, null, null);
        assertThat(updated.getCompanyName()).isEqualTo("List Corp 2");

        Company fromDb = companyRepository.findById(created.getId()).orElse(null);
        assertThat(fromDb).isNotNull();
        assertThat(fromDb.getCompanyName()).isEqualTo("List Corp 2");
    }

    @Test
    void testDeleteCompany() {
        Company created = getOrCreateCompany("list2@test.com", "List Corp 2");

        if (created.isDeleted()) {
            created.setDeleted(false);
            companyRepository.save(created);
        }

        companyService.deleteCompany(created.getId());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            companyService.getCompany(created.getId());
        });
        assertThat(exception.getMessage()).isEqualTo("Company not found");

        Company fromDb = companyRepository.findById(created.getId()).orElse(null);
        assertThat(fromDb).isNotNull();
        assertThat(fromDb.isDeleted()).isTrue();
    }
}
