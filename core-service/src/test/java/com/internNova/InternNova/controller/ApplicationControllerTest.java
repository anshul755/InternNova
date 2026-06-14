package com.internNova.InternNova.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

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
import com.internNova.InternNova.dto.ApplicationCreateDTO;
import com.internNova.InternNova.dto.ApplicationResponseDTO;
import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.enums.ApplicationState;
import com.internNova.InternNova.security.JwtUtil;
import com.internNova.InternNova.security.TalentAuthInterceptor;
import com.internNova.InternNova.services.ApplicationService;

@WebMvcTest(ApplicationController.class)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private TalentAuthInterceptor talentAuthInterceptor;

    @MockBean
    private JwtUtil jwtUtil;

    private ObjectMapper objectMapper;
    private Application testApplication;
    private ApplicationCreateDTO createDTO;
    private ApplicationResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

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

        responseDTO = new ApplicationResponseDTO();
        responseDTO.setId("app1");
        responseDTO.setJobId("job1");
        responseDTO.setStudentId("talent1");
        responseDTO.setStatus(ApplicationState.APPLIED);
        responseDTO.setCoverLetter("I am interested in this position");
        responseDTO.setAppliedAt(LocalDateTime.now());
        responseDTO.setJobTitle("Software Engineer");
        responseDTO.setCompanyName("Tech Corp");
        responseDTO.setStudentName("John Doe");
    }

    @Test
    void testCreateApplication() throws Exception {
        when(applicationService.createApplication(any(ApplicationCreateDTO.class), isNull())).thenReturn(testApplication);

        mockMvc.perform(post("/applications/v1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("app1"))
                .andExpect(jsonPath("$.jobId").value("job1"))
                .andExpect(jsonPath("$.studentId").value("talent1"));

        verify(applicationService).createApplication(any(ApplicationCreateDTO.class), isNull());
    }

    @Test
    void testCreateApplicationValidationError() throws Exception {
        ApplicationCreateDTO invalidDTO = new ApplicationCreateDTO();
        invalidDTO.setJobId(""); // Empty jobId

        mockMvc.perform(post("/applications/v1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(applicationService, never()).createApplication(any(ApplicationCreateDTO.class), any());
    }

    @Test
    void testCreateApplicationAlreadyExists() throws Exception {
        when(applicationService.createApplication(any(ApplicationCreateDTO.class), isNull()))
                .thenThrow(new RuntimeException("Application already exists for this job"));

        mockMvc.perform(post("/applications/v1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest());

        verify(applicationService).createApplication(any(ApplicationCreateDTO.class), isNull());
    }

    @Test
    void testGetApplicationsByJob() throws Exception {
        List<ApplicationResponseDTO> applications = Arrays.asList(responseDTO);
        when(applicationService.getApplicationsByJob("job1")).thenReturn(applications);

        mockMvc.perform(get("/applications/v1/job/job1")
                .param("page", "-1")
                .param("size", "-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("app1"));

        verify(applicationService).getApplicationsByJob("job1");
    }

    @Test
    void testGetApplicationsByJobWithPagination() throws Exception {
        List<ApplicationResponseDTO> applications = Arrays.asList(responseDTO);
        Page<ApplicationResponseDTO> applicationPage = new PageImpl<>(applications, PageRequest.of(0, 10), 1);
        when(applicationService.getApplicationsByJob(eq("job1"), any())).thenReturn(applicationPage);

        mockMvc.perform(get("/applications/v1/job/job1")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value("app1"));

        verify(applicationService).getApplicationsByJob(eq("job1"), any());
    }

    @Test
    void testGetApplicationsByStudent() throws Exception {
        List<ApplicationResponseDTO> applications = Arrays.asList(responseDTO);
        when(applicationService.getApplicationsByStudent("talent1")).thenReturn(applications);

        mockMvc.perform(get("/applications/v1/student/talent1")
                .param("page", "-1")
                .param("size", "-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentId").value("talent1"));

        verify(applicationService).getApplicationsByStudent("talent1");
    }

    @Test
    void testGetApplication() throws Exception {
        when(applicationService.getApplicationById(eq("app1"), anyBoolean())).thenReturn(responseDTO);

        mockMvc.perform(get("/applications/v1/app1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("app1"))
                .andExpect(jsonPath("$.jobTitle").value("Software Engineer"))
                .andExpect(jsonPath("$.companyName").value("Tech Corp"));

        verify(applicationService).getApplicationById("app1", false);
    }

    @Test
    void testGetApplicationNotFound() throws Exception {
        when(applicationService.getApplicationById(eq("nonexistent"), anyBoolean()))
                .thenThrow(new RuntimeException("Application not found"));

        mockMvc.perform(get("/applications/v1/nonexistent"))
                .andExpect(status().isNotFound());

        verify(applicationService).getApplicationById("nonexistent", false);
    }

    @Test
    void testShortlistApplication() throws Exception {
        testApplication.setStatus(ApplicationState.SHORTLISTED);
        when(applicationService.shortlistApplication("app1")).thenReturn(testApplication);

        mockMvc.perform(put("/applications/v1/app1/shortlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("app1"))
                .andExpect(jsonPath("$.status").value("SHORTLISTED"));

        verify(applicationService).shortlistApplication("app1");
    }

    @Test
    void testShortlistApplicationNotFound() throws Exception {
        when(applicationService.shortlistApplication("nonexistent"))
                .thenThrow(new RuntimeException("Application not found"));

        mockMvc.perform(put("/applications/v1/nonexistent/shortlist"))
                .andExpect(status().isNotFound());

        verify(applicationService).shortlistApplication("nonexistent");
    }

    @Test
    void testRejectApplication() throws Exception {
        testApplication.setStatus(ApplicationState.REJECTED);
        testApplication.setRecruiterNotes("Not a good fit");
        when(applicationService.rejectApplication(eq("app1"), eq("Not a good fit"))).thenReturn(testApplication);

        Map<String, String> requestBody = Map.of("recruiterNotes", "Not a good fit");

        mockMvc.perform(put("/applications/v1/app1/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("app1"))
                .andExpect(jsonPath("$.status").value("REJECTED"));

        verify(applicationService).rejectApplication("app1", "Not a good fit");
    }

    @Test
    void testRejectApplicationWithoutNotes() throws Exception {
        testApplication.setStatus(ApplicationState.REJECTED);
        when(applicationService.rejectApplication(eq("app1"), isNull())).thenReturn(testApplication);

        mockMvc.perform(put("/applications/v1/app1/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("app1"))
                .andExpect(jsonPath("$.status").value("REJECTED"));

        verify(applicationService).rejectApplication("app1", null);
    }

    @Test
    void testWithdrawApplication() throws Exception {
        doNothing().when(applicationService).withdrawApplication("app1");

        mockMvc.perform(put("/applications/v1/app1/withdraw"))
                .andExpect(status().isNoContent());

        verify(applicationService).withdrawApplication("app1");
    }

    @Test
    void testDeleteApplication() throws Exception {
        doNothing().when(applicationService).deleteApplication("app1");

        mockMvc.perform(delete("/applications/v1/app1"))
                .andExpect(status().isNoContent());

        verify(applicationService).deleteApplication("app1");
    }

    @Test
    void testDeleteApplicationNotFound() throws Exception {
        doThrow(new RuntimeException("Application not found")).when(applicationService).deleteApplication("nonexistent");

        mockMvc.perform(delete("/applications/v1/nonexistent"))
                .andExpect(status().isNotFound());

        verify(applicationService).deleteApplication("nonexistent");
    }

    @Test
    void testGetJobApplicationStats() throws Exception {
        when(applicationService.getApplicationCountByJob("job1")).thenReturn(10L);
        when(applicationService.getApplicationsByJobAndStatus("job1", ApplicationState.APPLIED))
                .thenReturn(Arrays.asList(new Application(), new Application()));
        when(applicationService.getApplicationsByJobAndStatus("job1", ApplicationState.SHORTLISTED))
                .thenReturn(Arrays.asList(new Application()));
        when(applicationService.getApplicationsByJobAndStatus("job1", ApplicationState.REJECTED))
                .thenReturn(Arrays.asList());

        mockMvc.perform(get("/applications/v1/stats/job/job1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(10))
                .andExpect(jsonPath("$.appliedApplications").value(2))
                .andExpect(jsonPath("$.shortlistedApplications").value(1))
                .andExpect(jsonPath("$.rejectedApplications").value(0));

        verify(applicationService).getApplicationCountByJob("job1");
        verify(applicationService).getApplicationsByJobAndStatus("job1", ApplicationState.APPLIED);
        verify(applicationService).getApplicationsByJobAndStatus("job1", ApplicationState.SHORTLISTED);
        verify(applicationService).getApplicationsByJobAndStatus("job1", ApplicationState.REJECTED);
    }

    @Test
    void testGetStudentApplicationStats() throws Exception {
        when(applicationService.getApplicationCountByStudent("talent1")).thenReturn(5L);

        mockMvc.perform(get("/applications/v1/stats/student/talent1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(5));

        verify(applicationService).getApplicationCountByStudent("talent1");
    }
}