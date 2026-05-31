package com.internNova.InternNova.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import com.internNova.InternNova.repository.JobRepository;
import com.internNova.InternNova.entity.Job;
import java.util.List;
import java.util.ArrayList;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.TalentRepository;

@ExtendWith(MockitoExtension.class)
class TalentServiceTest {

    @Mock
    private TalentRepository talentRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private TalentService talentService;

    private Talent testTalent;
    private TalentDTO testTalentDTO;

    @BeforeEach
    void setUp() {
        testTalent = new Talent();
        testTalent.setId("1");
        testTalent.setName("Test Talent");
        testTalent.setUser(User.Talent);
        testTalent.setDeleted(false);

        testTalentDTO = new TalentDTO();
        testTalentDTO.setName("Updated Talent DTO");
    }

    @Test
    void testCreateTalent_Success() throws IOException {
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> {
            Talent t = i.getArgument(0);
            t.setId("new_id");
            return t;
        });

        Talent result = talentService.createTalent(testTalentDTO, null, null);

        assertNotNull(result.getId());
        assertEquals("Updated Talent DTO", result.getName());
        assertEquals(User.Talent, result.getUser());
        verify(talentRepository, times(1)).save(any(Talent.class));
    }

    @Test
    void testCreateTalent_WithFiles() throws IOException {
        MultipartFile resume = mock(MultipartFile.class);
        MultipartFile avatar = mock(MultipartFile.class);

        when(resume.isEmpty()).thenReturn(false);
        when(avatar.isEmpty()).thenReturn(false);

        when(cloudinaryService.uploadFile(resume)).thenReturn("http://resume.url");
        when(cloudinaryService.uploadFile(avatar)).thenReturn("http://avatar.url");
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.createTalent(testTalentDTO, resume, avatar);

        assertEquals("http://resume.url", result.getResumeUrl());
        assertEquals("http://avatar.url", result.getAvatarUrl());
        verify(cloudinaryService, times(1)).uploadFile(resume);
        verify(cloudinaryService, times(1)).uploadFile(avatar);
    }

    @Test
    void testGetTalent_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        Talent result = talentService.getTalent("1");

        assertEquals("Test Talent", result.getName());
    }

    @Test
    void testGetTalent_NotFound() {
        when(talentRepository.findById("99")).thenReturn(Optional.empty());

        Exception e = assertThrows(RuntimeException.class, () -> talentService.getTalent("99"));
        assertEquals("Talent not found", e.getMessage());
    }

    @Test
    void testGetTalent_Deleted() {
        testTalent.setDeleted(true);
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        Exception e = assertThrows(RuntimeException.class, () -> talentService.getTalent("1"));
        assertEquals("Talent not found", e.getMessage());
    }

    @Test
    void testUpdateTalent_Success() throws IOException {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.updateTalent("1", testTalentDTO, null, null);

        assertEquals("Updated Talent DTO", result.getName());
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testDeleteTalent_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        talentService.deleteTalent("1");

        assertTrue(testTalent.isDeleted());
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testSaveJob_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.saveJob("1", "job1");

        assertTrue(result.getSavedJobs().contains("job1"));
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testRemoveSavedJob_Success() {
        testTalent.setSavedJobs(new ArrayList<>(List.of("job1", "job2")));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.removeSavedJob("1", "job1");

        assertFalse(result.getSavedJobs().contains("job1"));
        assertTrue(result.getSavedJobs().contains("job2"));
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testGetSavedJobs_Success() {
        testTalent.setSavedJobs(new ArrayList<>(List.of("job1", "job2")));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        
        Job job1 = new Job();
        job1.setId("job1");
        Job job2 = new Job();
        job2.setId("job2");
        when(jobRepository.findAllById(anyList())).thenReturn(List.of(job1, job2));

        List<Job> result = talentService.getSavedJobs("1");

        assertEquals(2, result.size());
        verify(jobRepository, times(1)).findAllById(testTalent.getSavedJobs());
    }
}
