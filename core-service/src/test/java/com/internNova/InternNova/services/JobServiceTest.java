package com.internNova.InternNova.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.internNova.InternNova.dto.JobCreateDTO;
import com.internNova.InternNova.dto.JobUpdateDTO;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.enums.OpportunityType;
import com.internNova.InternNova.repository.JobRepository;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private Job testJob;
    private JobCreateDTO createDTO;
    private JobUpdateDTO updateDTO;

    @BeforeEach
    void setUp() {
        testJob = new Job();
        testJob.setId("job1");
        testJob.setCompanyId("company1");
        testJob.setTitle("Software Engineer Intern");
        testJob.setDescription("Great opportunity for students");
        testJob.setSkillsRequired(Arrays.asList("Java", "Spring Boot"));
        testJob.setLocation("New York");
        testJob.setRemoteOption(true);
        testJob.setJobType(OpportunityType.INTERNSHIP);
        testJob.setViewsCount(0L);
        testJob.setApplicationsCount(0L);
        testJob.setDeleted(false);

        createDTO = new JobCreateDTO();
        createDTO.setCompanyId("company1");
        createDTO.setTitle("Software Engineer Intern");
        createDTO.setDescription("Great opportunity for students");
        createDTO.setSkillsRequired(Arrays.asList("Java", "Spring Boot"));
        createDTO.setLocation("New York");
        createDTO.setRemoteOption(true);
        createDTO.setJobType(OpportunityType.INTERNSHIP);
        createDTO.setStartDate(LocalDate.now().plusDays(30));
        createDTO.setApplicationDeadline(LocalDate.now().plusDays(15));

        updateDTO = new JobUpdateDTO();
        updateDTO.setTitle("Senior Software Engineer");
        updateDTO.setDescription("Updated description");
    }

    @Test
    void testCreateJob() {
        // Given
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        Job result = jobService.createJob(createDTO);

        // Then
        assertNotNull(result);
        assertEquals(testJob.getTitle(), result.getTitle());
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testGetAllJobs() {
        // Given
        List<Job> jobs = Arrays.asList(testJob);
        when(jobRepository.findByIsDeletedFalse()).thenReturn(jobs);

        // When
        List<Job> result = jobService.getAllJobs();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testJob.getTitle(), result.get(0).getTitle());
        verify(jobRepository).findByIsDeletedFalse();
    }

    @Test
    void testGetAllJobsWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Job> jobPage = new PageImpl<>(Arrays.asList(testJob));
        when(jobRepository.findByIsDeletedFalse(pageable)).thenReturn(jobPage);

        // When
        Page<Job> result = jobService.getAllJobs(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testJob.getTitle(), result.getContent().get(0).getTitle());
        verify(jobRepository).findByIsDeletedFalse(pageable);
    }

    @Test
    void testGetJobById() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        Optional<Job> result = jobService.getJobById("job1");

        // Then
        assertTrue(result.isPresent());
        assertEquals(testJob.getTitle(), result.get().getTitle());
        // View count should be incremented
        verify(jobRepository).save(any(Job.class));
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
    }

    @Test
    void testGetJobByIdNotFound() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        // When
        Optional<Job> result = jobService.getJobById("nonexistent");

        // Then
        assertFalse(result.isPresent());
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testGetJob() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        Job result = jobService.getJob("job1");

        // Then
        assertNotNull(result);
        assertEquals(testJob.getTitle(), result.getTitle());
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testGetJobNotFound() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> jobService.getJob("nonexistent"));
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testGetJobsByCompany() {
        // Given
        List<Job> jobs = Arrays.asList(testJob);
        when(jobRepository.findByCompanyIdAndIsDeletedFalse("company1")).thenReturn(jobs);

        // When
        List<Job> result = jobService.getJobsByCompany("company1");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testJob.getCompanyId(), result.get(0).getCompanyId());
        verify(jobRepository).findByCompanyIdAndIsDeletedFalse("company1");
    }

    @Test
    void testUpdateJob() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        Job result = jobService.updateJob("job1", updateDTO);

        // Then
        assertNotNull(result);
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testUpdateJobNotFound() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> jobService.updateJob("nonexistent", updateDTO));
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testDeleteJob() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        jobService.deleteJob("job1");

        // Then
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(argThat(job -> job.isDeleted()));
    }

    @Test
    void testDeleteJobNotFound() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> jobService.deleteJob("nonexistent"));
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testIncrementApplicationCount() {
        // Given
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        jobService.incrementApplicationCount("job1");

        // Then
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(argThat(job -> job.getApplicationsCount() == 1L));
    }

    @Test
    void testDecrementApplicationCount() {
        // Given
        testJob.setApplicationsCount(5L);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        // When
        jobService.decrementApplicationCount("job1");

        // Then
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(argThat(job -> job.getApplicationsCount() == 4L));
    }

    @Test
    void testSearchJobs() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Job> jobPage = new PageImpl<>(Arrays.asList(testJob));
        when(jobRepository.searchJobs("Java", pageable)).thenReturn(jobPage);

        // When
        Page<Job> result = jobService.searchJobs("Java", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(jobRepository).searchJobs("Java", pageable);
    }
}