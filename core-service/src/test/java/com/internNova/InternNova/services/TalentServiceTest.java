package com.internNova.InternNova.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import com.internNova.InternNova.entity.*;
import com.internNova.InternNova.repository.JobRepository;
import com.internNova.InternNova.repository.TalentRepository;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.enums.User;

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


    @Test
    void testValidateOwnership_Success() {
        assertDoesNotThrow(() -> talentService.validateOwnership("1", "1"));
    }

    @Test
    void testValidateOwnership_Denied() {
        Exception e = assertThrows(RuntimeException.class,
                () -> talentService.validateOwnership("1", "2"));
        assertTrue(e.getMessage().contains("Access denied"));
    }

    @Test
    void testValidateOwnership_NullRequester() {
        Exception e = assertThrows(RuntimeException.class,
                () -> talentService.validateOwnership("1", null));
        assertTrue(e.getMessage().contains("Access denied"));
    }


    @Test
    void testAddExperience_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Experience exp = new Experience();
        exp.setCompany("Google");
        exp.setRole("SWE Intern");
        exp.setBulletPoints(List.of("Built <b>stuff</b>", "Improved **perf** by 30%"));

        Talent result = talentService.addExperience("1", exp);

        assertEquals(1, result.getExperience().size());
        assertEquals("Google", result.getExperience().get(0).getCompany());
        assertEquals("Built stuff", result.getExperience().get(0).getBulletPoints().get(0));
        assertEquals("Improved perf by 30%", result.getExperience().get(0).getBulletPoints().get(1));
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testAddExperience_InitializesNullList() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Experience exp = new Experience();
        exp.setCompany("Google");

        Talent result = talentService.addExperience("1", exp);
        assertEquals(1, result.getExperience().size());
    }

    @Test
    void testUpdateExperience_Success() {
        Experience existing = new Experience();
        existing.setCompany("Old Co");
        testTalent.setExperience(new ArrayList<>(List.of(existing)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Experience updated = new Experience();
        updated.setCompany("New Co");
        Talent result = talentService.updateExperience("1", 0, updated);

        assertEquals("New Co", result.getExperience().get(0).getCompany());
    }

    @Test
    void testUpdateExperience_OutOfBounds() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        Exception e = assertThrows(RuntimeException.class,
                () -> talentService.updateExperience("1", 0, new Experience()));
        assertTrue(e.getMessage().contains("not found"));
    }

    @Test
    void testDeleteExperience_Success() {
        Experience exp = new Experience();
        exp.setCompany("Google");
        testTalent.setExperience(new ArrayList<>(List.of(exp)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.deleteExperience("1", 0);
        assertTrue(result.getExperience().isEmpty());
    }

    @Test
    void testDeleteExperience_OutOfBounds() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        Exception e = assertThrows(RuntimeException.class,
                () -> talentService.deleteExperience("1", 0));
        assertTrue(e.getMessage().contains("not found"));
    }


    @Test
    void testAddProject_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Project proj = new Project();
        proj.setName("Portfolio Tracker");
        proj.setDescription("<p>A full-stack app</p>");
        proj.setHighlights(List.of("**200+** users"));

        Talent result = talentService.addProject("1", proj);

        assertEquals(1, result.getProjects().size());
        assertEquals("A full-stack app", result.getProjects().get(0).getDescription());
        assertEquals("200+ users", result.getProjects().get(0).getHighlights().get(0));
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testUpdateProject_Success() {
        Project existing = new Project();
        existing.setName("Old Project");
        testTalent.setProjects(new ArrayList<>(List.of(existing)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Project updated = new Project();
        updated.setName("New Project");
        Talent result = talentService.updateProject("1", 0, updated);

        assertEquals("New Project", result.getProjects().get(0).getName());
    }

    @Test
    void testDeleteProject_Success() {
        Project proj = new Project();
        testTalent.setProjects(new ArrayList<>(List.of(proj)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.deleteProject("1", 0);
        assertTrue(result.getProjects().isEmpty());
    }


    @Test
    void testAddCertification_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Certification cert = new Certification();
        cert.setName("<b>AWS</b> Cloud Practitioner");
        cert.setIssuer("Amazon");

        Talent result = talentService.addCertification("1", cert);

        assertEquals(1, result.getCertifications().size());
        assertEquals("AWS Cloud Practitioner", result.getCertifications().get(0).getName());
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testUpdateCertification_Success() {
        Certification existing = new Certification();
        existing.setName("Old Cert");
        testTalent.setCertifications(new ArrayList<>(List.of(existing)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Certification updated = new Certification();
        updated.setName("New Cert");
        Talent result = talentService.updateCertification("1", 0, updated);

        assertEquals("New Cert", result.getCertifications().get(0).getName());
    }

    @Test
    void testDeleteCertification_Success() {
        Certification cert = new Certification();
        testTalent.setCertifications(new ArrayList<>(List.of(cert)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.deleteCertification("1", 0);
        assertTrue(result.getCertifications().isEmpty());
    }


    @Test
    void testAddAchievement_Success() {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Achievement ach = new Achievement();
        ach.setTitle("**Hackathon** Winner");
        ach.setDescription("Won <i>first</i> place");

        Talent result = talentService.addAchievement("1", ach);

        assertEquals(1, result.getAchievements().size());
        assertEquals("Hackathon Winner", result.getAchievements().get(0).getTitle());
        assertEquals("Won first place", result.getAchievements().get(0).getDescription());
        verify(talentRepository, times(1)).save(testTalent);
    }

    @Test
    void testUpdateAchievement_Success() {
        Achievement existing = new Achievement();
        existing.setTitle("Old Achievement");
        testTalent.setAchievements(new ArrayList<>(List.of(existing)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Achievement updated = new Achievement();
        updated.setTitle("New Achievement");
        Talent result = talentService.updateAchievement("1", 0, updated);

        assertEquals("New Achievement", result.getAchievements().get(0).getTitle());
    }

    @Test
    void testDeleteAchievement_Success() {
        Achievement ach = new Achievement();
        testTalent.setAchievements(new ArrayList<>(List.of(ach)));
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        Talent result = talentService.deleteAchievement("1", 0);
        assertTrue(result.getAchievements().isEmpty());
    }


    @Test
    void testGetFullProfile_NullSafety() {
        // Talent with all null optional fields
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        Talent result = talentService.getFullProfile("1");

        assertNotNull(result.getExperience());
        assertNotNull(result.getProjects());
        assertNotNull(result.getCertifications());
        assertNotNull(result.getAchievements());
        assertNotNull(result.getSkills());
        assertEquals("", result.getResumeSummary());
        assertEquals("", result.getLinkedinUrl());
        assertEquals("", result.getGithubUrl());
    }

    @Test
    void testGetFullProfile_PreservesExistingData() {
        testTalent.setSkills(List.of("Java", "Python"));
        testTalent.setLinkedinUrl("https://linkedin.com/in/test");
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));

        Talent result = talentService.getFullProfile("1");

        assertEquals(2, result.getSkills().size());
        assertEquals("https://linkedin.com/in/test", result.getLinkedinUrl());
    }


    @Test
    void testUpdateTalentFromDTO_IncludesNewFields() throws IOException {
        when(talentRepository.findById("1")).thenReturn(Optional.of(testTalent));
        when(talentRepository.save(any(Talent.class))).thenAnswer(i -> i.getArgument(0));

        testTalentDTO.setResumeSummary("<b>Summary</b> with **markdown**");
        testTalentDTO.setExperience(List.of(new Experience()));
        testTalentDTO.setProjects(List.of(new Project()));

        Talent result = talentService.updateTalent("1", testTalentDTO, null, null);

        assertEquals("Summary with markdown", result.getResumeSummary());
        assertNotNull(result.getExperience());
        assertEquals(1, result.getExperience().size());
        assertNotNull(result.getProjects());
        assertEquals(1, result.getProjects().size());
    }
}
