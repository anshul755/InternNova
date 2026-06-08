package com.internNova.InternNova.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.internNova.InternNova.dto.JobCreateDTO;
import com.internNova.InternNova.dto.JobUpdateDTO;
import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.enums.OpportunityType;
import com.internNova.InternNova.security.JwtUtil;
import com.internNova.InternNova.security.TalentAuthInterceptor;
import com.internNova.InternNova.services.JobService;

@WebMvcTest(JobController.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    @MockBean
    private TalentAuthInterceptor talentAuthInterceptor;

    @MockBean
    private JwtUtil jwtUtil;

    private ObjectMapper objectMapper;
    private Job testJob;
    private JobCreateDTO createDTO;
    private JobUpdateDTO updateDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

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
    void testCreateJob() throws Exception {
        when(jobService.createJob(any(JobCreateDTO.class))).thenReturn(testJob);

        mockMvc.perform(post("/jobs/v1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("job1"))
                .andExpect(jsonPath("$.title").value("Software Engineer Intern"))
                .andExpect(jsonPath("$.companyId").value("company1"));

        verify(jobService).createJob(any(JobCreateDTO.class));
    }

    @Test
    void testCreateJobWithValidationError() throws Exception {
        JobCreateDTO invalidDTO = new JobCreateDTO();
        invalidDTO.setTitle(""); // Empty title

        mockMvc.perform(post("/jobs/v1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(jobService, never()).createJob(any(JobCreateDTO.class));
    }

    @Test
    void testGetAllJobs() throws Exception {
        List<Job> jobs = Arrays.asList(testJob);
        Page<Job> jobPage = new PageImpl<>(jobs, PageRequest.of(0, 10), 1);
        when(jobService.getAllJobs(any())).thenReturn(jobPage);

        mockMvc.perform(get("/jobs/v1")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value("job1"));

        verify(jobService).getAllJobs(any());
    }

    @Test
    void testGetAllJobsWithSearch() throws Exception {
        List<Job> jobs = Arrays.asList(testJob);
        Page<Job> jobPage = new PageImpl<>(jobs, PageRequest.of(0, 10), 1);
        when(jobService.searchJobs(eq("Java"), any())).thenReturn(jobPage);

        mockMvc.perform(get("/jobs/v1")
                .param("search", "Java")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1));

        verify(jobService).searchJobs(eq("Java"), any());
    }

    @Test
    void testGetAllJobsByCompany() throws Exception {
        List<Job> jobs = Arrays.asList(testJob);
        Page<Job> jobPage = new PageImpl<>(jobs, PageRequest.of(0, 10), 1);
        when(jobService.getJobsByCompany(eq("company1"), any())).thenReturn(jobPage);

        mockMvc.perform(get("/jobs/v1")
                .param("companyId", "company1")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1));

        verify(jobService).getJobsByCompany(eq("company1"), any());
    }

    @Test
    void testGetJobById() throws Exception {
        when(jobService.getJobById("job1", null)).thenReturn(Optional.of(testJob));

        mockMvc.perform(get("/jobs/v1/job1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("job1"))
                .andExpect(jsonPath("$.title").value("Software Engineer Intern"));

        verify(jobService).getJobById("job1", null);
    }

    @Test
    void testGetJobByIdNotFound() throws Exception {
        when(jobService.getJobById("nonexistent", null)).thenReturn(Optional.empty());

        mockMvc.perform(get("/jobs/v1/nonexistent"))
                .andExpect(status().isNotFound());

        verify(jobService).getJobById("nonexistent", null);
    }

    @Test
    void testUpdateJob() throws Exception {
        when(jobService.updateJob(eq("job1"), any(JobUpdateDTO.class))).thenReturn(testJob);

        mockMvc.perform(put("/jobs/v1/job1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("job1"));

        verify(jobService).updateJob(eq("job1"), any(JobUpdateDTO.class));
    }

    @Test
    void testUpdateJobNotFound() throws Exception {
        when(jobService.updateJob(eq("nonexistent"), any(JobUpdateDTO.class)))
                .thenThrow(new RuntimeException("Job not found"));

        mockMvc.perform(put("/jobs/v1/nonexistent")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());

        verify(jobService).updateJob(eq("nonexistent"), any(JobUpdateDTO.class));
    }

    @Test
    void testDeleteJob() throws Exception {
        doNothing().when(jobService).deleteJob("job1");

        mockMvc.perform(delete("/jobs/v1/job1"))
                .andExpect(status().isNoContent());

        verify(jobService).deleteJob("job1");
    }

    @Test
    void testDeleteJobNotFound() throws Exception {
        doThrow(new RuntimeException("Job not found")).when(jobService).deleteJob("nonexistent");

        mockMvc.perform(delete("/jobs/v1/nonexistent"))
                .andExpect(status().isNotFound());

        verify(jobService).deleteJob("nonexistent");
    }

    @Test
    void testGetJobsByCompany() throws Exception {
        List<Job> jobs = Arrays.asList(testJob);
        when(jobService.getJobsByCompany("company1")).thenReturn(jobs);

        mockMvc.perform(get("/jobs/v1/company/company1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("job1"));

        verify(jobService).getJobsByCompany("company1");
    }
}