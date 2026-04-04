package com.internNova.InternNova.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.internNova.InternNova.dto.CompanyDTO;
import com.internNova.InternNova.entity.Company;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.CompanyRepository;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CompanyService companyService;

    private Company testCompany;
    private CompanyDTO testCompanyDTO;

    @BeforeEach
    void setUp() {
        testCompany = new Company();
        testCompany.setId("1");
        testCompany.setCompanyName("Test Corp");
        testCompany.setUser(User.Company);
        testCompany.setDeleted(false);

        testCompanyDTO = new CompanyDTO();
        testCompanyDTO.setCompanyName("Test Corp DTO");
        testCompanyDTO.setUser(User.Company);
    }

    @Test
    void testGetAllCompanies() {
        when(companyRepository.findByIsDeletedFalse()).thenReturn(Arrays.asList(testCompany));

        List<Company> result = companyService.getAllCompanies();

        assertEquals(1, result.size());
        assertEquals("Test Corp", result.get(0).getCompanyName());
        verify(companyRepository, times(1)).findByIsDeletedFalse();
    }

    @Test
    void testCreateCompany_Success() throws IOException {
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> {
            Company c = i.getArgument(0);
            c.setId("new_id");
            return c;
        });

        Company result = companyService.createCompany(testCompanyDTO, null);

        assertNotNull(result.getId());
        assertEquals("Test Corp DTO", result.getCompanyName());
        assertEquals(User.Company, result.getUser());
        verify(companyRepository, times(1)).save(any(Company.class));
        verify(cloudinaryService, never()).uploadFile(any());
    }

    @Test
    void testCreateCompany_WithLogo() throws IOException {
        MultipartFile logo = mock(MultipartFile.class);
        when(cloudinaryService.uploadFile(logo)).thenReturn("http://logo.url");
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        Company result = companyService.createCompany(testCompanyDTO, logo);

        assertEquals("http://logo.url", result.getLogoUrl());
        verify(cloudinaryService, times(1)).uploadFile(logo);
    }

    @Test
    void testGetCompany_Success() {
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));

        Company result = companyService.getCompany("1");

        assertEquals("Test Corp", result.getCompanyName());
    }

    @Test
    void testGetCompany_NotFound() {
        when(companyRepository.findById("99")).thenReturn(Optional.empty());

        Exception e = assertThrows(RuntimeException.class, () -> companyService.getCompany("99"));
        assertEquals("Company not found", e.getMessage());
    }

    @Test
    void testGetCompany_Deleted() {
        testCompany.setDeleted(true);
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));

        Exception e = assertThrows(RuntimeException.class, () -> companyService.getCompany("1"));
        assertEquals("Company not found", e.getMessage());
    }

    @Test
    void testDeleteCompany_Success() {
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));

        companyService.deleteCompany("1");

        assertTrue(testCompany.isDeleted());
        verify(companyRepository, times(1)).save(testCompany);
    }

    @Test
    void testUpdateCompany_Success() throws IOException {
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        Company result = companyService.updateCompany("1", testCompanyDTO, null);

        assertEquals("Test Corp DTO", result.getCompanyName());
        verify(companyRepository, times(1)).save(testCompany);
    }
}
