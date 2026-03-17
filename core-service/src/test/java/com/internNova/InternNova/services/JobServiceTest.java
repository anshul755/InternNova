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
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        Job result = jobService.createJob(createDTO);

        assertNotNull(result);
        assertEquals(testJob.getTitle(), result.getTitle());
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testGetAllJobs() {
        List<Job> jobs = Arrays.asList(testJob);
        when(jobRepository.findByIsDeletedFalseAndStatus("ACTIVE")).thenReturn(jobs);

        List<Job> result = jobService.getAllJobs();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testJob.getTitle(), result.get(0).getTitle());
        verify(jobRepository).findByIsDeletedFalseAndStatus("ACTIVE");
    }

    @Test
    void testGetAllJobsWithPagination() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Job> jobPage = new PageImpl<>(Arrays.asList(testJob));
        when(jobRepository.findByIsDeletedFalseAndStatus("ACTIVE", pageable)).thenReturn(jobPage);

        Page<Job> result = jobService.getAllJobs(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testJob.getTitle(), result.getContent().get(0).getTitle());
        verify(jobRepository).findByIsDeletedFalseAndStatus("ACTIVE", pageable);
    }

    @Test
    void testGetJobById() {
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        Optional<Job> result = jobService.getJobById("job1", "talent-123");

        assertTrue(result.isPresent());
        assertEquals(testJob.getTitle(), result.get().getTitle());
        // View count should be incremented
        verify(jobRepository).save(any(Job.class));
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
    }

    @Test
    void testGetJobByIdNotFound() {
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        Optional<Job> result = jobService.getJobById("nonexistent", "talent-123");

        assertFalse(result.isPresent());
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testGetJob() {
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        Job result = jobService.getJob("job1", "talent-123");

        assertNotNull(result);
        assertEquals(testJob.getTitle(), result.getTitle());
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testGetJobNotFound() {
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobService.getJob("nonexistent", "talent-123"));
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testGetJobsByCompany() {
        List<Job> jobs = Arrays.asList(testJob);
        when(jobRepository.findByCompanyIdAndIsDeletedFalse("company1")).thenReturn(jobs);

        List<Job> result = jobService.getJobsByCompany("company1");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testJob.getCompanyId(), result.get(0).getCompanyId());
        verify(jobRepository).findByCompanyIdAndIsDeletedFalse("company1");
    }

    @Test
    void testUpdateJob() {
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        Job result = jobService.updateJob("job1", updateDTO);

        assertNotNull(result);
        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testUpdateJobNotFound() {
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobService.updateJob("nonexistent", updateDTO));
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testDeleteJob() {
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        jobService.deleteJob("job1");

        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(argThat(job -> job.isDeleted()));
    }

    @Test
    void testDeleteJobNotFound() {
        when(jobRepository.findByIdAndIsDeletedFalse("nonexistent")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobService.deleteJob("nonexistent"));
        verify(jobRepository).findByIdAndIsDeletedFalse("nonexistent");
    }

    @Test
    void testIncrementApplicationCount() {
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        jobService.incrementApplicationCount("job1");

        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(argThat(job -> job.getApplicationsCount() == 1L));
    }

    @Test
    void testDecrementApplicationCount() {
        testJob.setApplicationsCount(5L);
        when(jobRepository.findByIdAndIsDeletedFalse("job1")).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        jobService.decrementApplicationCount("job1");

        verify(jobRepository).findByIdAndIsDeletedFalse("job1");
        verify(jobRepository).save(argThat(job -> job.getApplicationsCount() == 4L));
    }

    @Test
    void testSearchJobs() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Job> jobPage = new PageImpl<>(Arrays.asList(testJob));
        when(jobRepository.searchActiveJobs("Java", pageable)).thenReturn(jobPage);

        Page<Job> result = jobService.searchJobs("Java", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(jobRepository).searchActiveJobs("Java", pageable);
    }
}