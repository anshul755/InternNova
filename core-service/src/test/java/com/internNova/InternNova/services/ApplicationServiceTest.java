package com.internNova.InternNova.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.internNova.InternNova.dto.ApplicationCreateDTO;
import com.internNova.InternNova.dto.ApplicationResponseDTO;
import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.entity.Company;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.enums.ApplicationState;
import com.internNova.InternNova.repository.ApplicationRepository;
import com.internNova.InternNova.repository.CompanyRepository;
import com.internNova.InternNova.repository.JobRepository;
import com.internNova.InternNova.repository.TalentRepository;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private TalentRepository talentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private JobService jobService;

    @InjectMocks
    private ApplicationService applicationService;

    private Application testApplication;
    private ApplicationCreateDTO createDTO;
    private Job testJob;
    private Talent testTalent;
    private Company testCompany;

    @BeforeEach
    void setUp() {
        testApplication = new Application();
        testApplication.setId("app1");
        testApplication.setJobId("job1");
        testApplication.setStudentId("talent1");
        testApplication.setStatus(ApplicationState.PENDING);
        testApplication.setCoverLetter("I am interested in this position");
        testApplication.setAppliedAt(LocalDateTime.now());
        testApplication.setDeleted(false);

        createDTO = new ApplicationCreateDTO();
        createDTO.setJobId("job1");
        createDTO.setStudentId("talent1");
        createDTO.setCoverLetter("I am interested in this position");

        testJob = new Job();
        testJob.setId("job1");
        testJob.setTitle("Software Engineer");
        testJob.setCompanyId("company1");
        testJob.setDeleted(false);

        testTalent = new Talent();
        testTalent.setId("talent1");
        testTalent.setName("John Doe");
        testTalent.setDeleted(false);

        testCompany = new Company();
        testCompany.setId("company1");
        testCompany.setCompanyName("Tech Corp");
        testCompany.setDeleted(false);
    }

    @Test
    void testCreateApplication() {
        // Given
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(false);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        Application result = applicationService.createApplication(createDTO);

        // Then
        assertNotNull(result);
        assertEquals(testApplication.getJobId(), result.getJobId());
        assertEquals(testApplication.getStudentId(), result.getStudentId());
        verify(applicationRepository).save(any(Application.class));
        verify(jobService).incrementApplicationCount("job1");
    }

    @Test
    void testCreateApplicationAlreadyExists() {
        // Given
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> applicationService.createApplication(createDTO));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void testCreateApplicationJobNotFound() {
        // Given
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(false);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> applicationService.createApplication(createDTO));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void testCreateApplicationTalentNotFound() {
        // Given
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(false);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(talentRepository.findById("talent1")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> applicationService.createApplication(createDTO));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void testGetApplicationsByJob() {
        // Given
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByJobIdAndIsDeletedFalse("job1")).thenReturn(applications);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(companyRepository.findById("company1")).thenReturn(Optional.of(testCompany));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));

        // When
        List<ApplicationResponseDTO> result = applicationService.getApplicationsByJob("job1");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getJobId(), result.get(0).getJobId());
        assertEquals(testJob.getTitle(), result.get(0).getJobTitle());
        assertEquals(testCompany.getCompanyName(), result.get(0).getCompanyName());
        assertEquals(testTalent.getName(), result.get(0).getStudentName());
        verify(applicationRepository).findByJobIdAndIsDeletedFalse("job1");
    }

    @Test
    void testGetApplicationsByStudent() {
        // Given
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByStudentIdAndIsDeletedFalse("talent1")).thenReturn(applications);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(companyRepository.findById("company1")).thenReturn(Optional.of(testCompany));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));

        // When
        List<ApplicationResponseDTO> result = applicationService.getApplicationsByStudent("talent1");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getStudentId(), result.get(0).getStudentId());
        verify(applicationRepository).findByStudentIdAndIsDeletedFalse("talent1");
    }

    @Test
    void testGetApplicationById() {
        // Given
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(companyRepository.findById("company1")).thenReturn(Optional.of(testCompany));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));

        // When
        ApplicationResponseDTO result = applicationService.getApplicationById("app1");

        // Then
        assertNotNull(result);
        assertEquals(testApplication.getId(), result.getId());
        assertEquals(testJob.getTitle(), result.getJobTitle());
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
    }

    @Test
    void testGetApplicationByIdNotFound() {
        // Given
        when(applicationRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> applicationService.getApplicationById("nonexistent"));
        verify(applicationRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testShortlistApplication() {
        // Given
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        Application result = applicationService.shortlistApplication("app1");

        // Then
        assertNotNull(result);
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> app.getStatus() == ApplicationState.SHORTLISTED));
    }

    @Test
    void testRejectApplication() {
        // Given
        String recruiterNotes = "Not a good fit";
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        Application result = applicationService.rejectApplication("app1", recruiterNotes);

        // Then
        assertNotNull(result);
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> 
            app.getStatus() == ApplicationState.REJECTED && 
            app.getRecruiterNotes().equals(recruiterNotes)
        ));
    }

    @Test
    void testDeleteApplication() {
        // Given
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        applicationService.deleteApplication("app1");

        // Then
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> app.isDeleted()));
        verify(jobService).decrementApplicationCount("job1");
    }

    @Test
    void testWithdrawApplication() {
        // Given
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        applicationService.withdrawApplication("app1");

        // Then
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> app.getStatus() == ApplicationState.WITHDRAWN));
    }

    @Test
    void testGetApplicationsByJobAndStatus() {
        // Given
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByJobIdAndStatusAndIsDeletedFalse("job1", ApplicationState.PENDING))
            .thenReturn(applications);

        // When
        List<Application> result = applicationService.getApplicationsByJobAndStatus("job1", ApplicationState.PENDING);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ApplicationState.PENDING, result.get(0).getStatus());
        verify(applicationRepository).findByJobIdAndStatusAndIsDeletedFalse("job1", ApplicationState.PENDING);
    }

    @Test
    void testGetApplicationCountByJob() {
        // Given
        when(applicationRepository.countByJobIdAndIsDeletedFalse("job1")).thenReturn(5L);

        // When
        long result = applicationService.getApplicationCountByJob("job1");

        // Then
        assertEquals(5L, result);
        verify(applicationRepository).countByJobIdAndIsDeletedFalse("job1");
    }

    @Test
    void testGetApplicationCountByStudent() {
        // Given
        when(applicationRepository.countByStudentIdAndIsDeletedFalse("talent1")).thenReturn(3L);

        // When
        long result = applicationService.getApplicationCountByStudent("talent1");

        // Then
        assertEquals(3L, result);
        verify(applicationRepository).countByStudentIdAndIsDeletedFalse("talent1");
    }
}