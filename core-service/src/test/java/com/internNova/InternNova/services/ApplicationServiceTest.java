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
import com.internNova.InternNova.services.CloudinaryService;

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

    @Mock
    private CloudinaryService cloudinaryService;

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
        testApplication.setStatus(ApplicationState.APPLIED);
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
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(false);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        Application result = applicationService.createApplication(createDTO);

        assertNotNull(result);
        assertEquals(testApplication.getJobId(), result.getJobId());
        assertEquals(testApplication.getStudentId(), result.getStudentId());
        verify(applicationRepository).save(any(Application.class));
        verify(jobService).incrementApplicationCount("job1");
    }

    @Test
    void testCreateApplicationAlreadyExists() {
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(true);

        assertThrows(RuntimeException.class, () -> applicationService.createApplication(createDTO));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void testCreateApplicationJobNotFound() {
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(false);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> applicationService.createApplication(createDTO));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void testCreateApplicationTalentNotFound() {
        when(applicationRepository.existsByJobIdAndStudentIdAndIsDeletedFalse("job1", "talent1"))
            .thenReturn(false);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(talentRepository.findById("talent1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> applicationService.createApplication(createDTO));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void testGetApplicationsByJob() {
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByJobIdAndIsDeletedFalse("job1")).thenReturn(applications);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(companyRepository.findById("company1")).thenReturn(Optional.of(testCompany));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));

        List<ApplicationResponseDTO> result = applicationService.getApplicationsByJob("job1");

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
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByStudentIdAndIsDeletedFalse("talent1")).thenReturn(applications);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(companyRepository.findById("company1")).thenReturn(Optional.of(testCompany));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));

        List<ApplicationResponseDTO> result = applicationService.getApplicationsByStudent("talent1");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getStudentId(), result.get(0).getStudentId());
        verify(applicationRepository).findByStudentIdAndIsDeletedFalse("talent1");
    }

    @Test
    void testGetApplicationById() {
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(companyRepository.findById("company1")).thenReturn(Optional.of(testCompany));
        when(talentRepository.findById("talent1")).thenReturn(Optional.of(testTalent));

        ApplicationResponseDTO result = applicationService.getApplicationById("app1");

        assertNotNull(result);
        assertEquals(testApplication.getId(), result.getId());
        assertEquals(testJob.getTitle(), result.getJobTitle());
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
    }

    @Test
    void testGetApplicationByIdNotFound() {
        when(applicationRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> applicationService.getApplicationById("nonexistent"));
        verify(applicationRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testShortlistApplication() {
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        Application result = applicationService.shortlistApplication("app1");

        assertNotNull(result);
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> app.getStatus() == ApplicationState.SHORTLISTED));
    }

    @Test
    void testRejectApplication() {
        String recruiterNotes = "Not a good fit";
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        Application result = applicationService.rejectApplication("app1", recruiterNotes);

        assertNotNull(result);
        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> 
            app.getStatus() == ApplicationState.REJECTED && 
            app.getRecruiterNotes().equals(recruiterNotes)
        ));
    }

    @Test
    void testDeleteApplication() {
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        applicationService.deleteApplication("app1");

        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> app.isDeleted()));
        verify(jobService).decrementApplicationCount("job1");
    }

    @Test
    void testWithdrawApplication() {
        when(applicationRepository.findByIdAndIsDeletedFalse("app1")).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        applicationService.withdrawApplication("app1");

        verify(applicationRepository).findByIdAndIsDeletedFalse("app1");
        verify(applicationRepository).save(argThat(app -> app.getStatus() == ApplicationState.WITHDRAWN));
    }

    @Test
    void testGetApplicationsByJobAndStatus() {
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByJobIdAndStatusAndIsDeletedFalse("job1", ApplicationState.APPLIED))
            .thenReturn(applications);

        List<Application> result = applicationService.getApplicationsByJobAndStatus("job1", ApplicationState.APPLIED);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ApplicationState.APPLIED, result.get(0).getStatus());
        verify(applicationRepository).findByJobIdAndStatusAndIsDeletedFalse("job1", ApplicationState.APPLIED);
    }

    @Test
    void testGetApplicationCountByJob() {
        when(applicationRepository.countByJobIdAndIsDeletedFalse("job1")).thenReturn(5L);

        long result = applicationService.getApplicationCountByJob("job1");

        assertEquals(5L, result);
        verify(applicationRepository).countByJobIdAndIsDeletedFalse("job1");
    }

    @Test
    void testGetApplicationCountByStudent() {
        when(applicationRepository.countByStudentIdAndIsDeletedFalse("talent1")).thenReturn(3L);

        long result = applicationService.getApplicationCountByStudent("talent1");

        assertEquals(3L, result);
        verify(applicationRepository).countByStudentIdAndIsDeletedFalse("talent1");
    }
}