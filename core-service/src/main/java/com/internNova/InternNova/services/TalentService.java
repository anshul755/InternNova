package com.internNova.InternNova.services;

import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.entity.*;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.JobRepository;
import com.internNova.InternNova.repository.TalentRepository;
import com.internNova.InternNova.util.SanitizationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class TalentService {

    @Autowired
    private TalentRepository talentRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private JobRepository jobRepository;

    public Talent createTalent(TalentDTO talentDTO, MultipartFile resume, MultipartFile avatar)
            throws IOException {

        Talent talent = new Talent();
        if (talentDTO.getId() != null && !talentDTO.getId().isBlank()) {
            talent.setId(talentDTO.getId());
        }
        talent.setUser(User.Talent);
        updateTalentFromDTO(talent, talentDTO);

        if (resume != null && !resume.isEmpty()) {
            String resumeUrl = cloudinaryService.uploadFile(resume);
            talent.setResumeUrl(resumeUrl);
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = cloudinaryService.uploadFile(avatar);
            talent.setAvatarUrl(avatarUrl);
        }

        return talentRepository.save(talent);
    }

    public Talent getTalent(String id) {
        Talent talent = talentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Talent not found"));
        if (talent.isDeleted()) {
            throw new RuntimeException("Talent not found");
        }
        return talent;
    }

    public Talent updateTalent(String id, TalentDTO talentDTO, MultipartFile resume,
            MultipartFile avatar)
            throws IOException {
        Talent talent = getTalent(id);
        if (talent.isDeleted()) {
            throw new RuntimeException("Talent not found");
        }

        if (resume != null && !resume.isEmpty()) {
            if (talent.getResumeUrl() != null) {
                cloudinaryService.deleteFile(talent.getResumeUrl());
            }
            String resumeUrl = cloudinaryService.uploadFile(resume);
            talent.setResumeUrl(resumeUrl);
        }

        if (avatar != null && !avatar.isEmpty()) {
            if (talent.getAvatarUrl() != null) {
                cloudinaryService.deleteFile(talent.getAvatarUrl());
            }
            String avatarUrl = cloudinaryService.uploadFile(avatar);
            talent.setAvatarUrl(avatarUrl);
        }

        updateTalentFromDTO(talent, talentDTO);

        return talentRepository.save(talent);
    }

    public void deleteTalent(String id) {
        Talent talent = getTalent(id);
        talent.setDeleted(true);
        talentRepository.save(talent);
    }

    public Talent saveJob(String talentId, String jobId) {
        Talent talent = getTalent(talentId);

        if (talent.getSavedJobs() == null) {
            talent.setSavedJobs(new ArrayList<>());
        }

        if (!talent.getSavedJobs().contains(jobId)) {
            talent.getSavedJobs().add(jobId);
            talentRepository.save(talent);
        }

        return talent;
    }

    public Talent removeSavedJob(String talentId, String jobId) {
        Talent talent = getTalent(talentId);

        if (talent.getSavedJobs() != null && talent.getSavedJobs().contains(jobId)) {
            talent.getSavedJobs().remove(jobId);
            talentRepository.save(talent);
        }

        return talent;
    }

    public List<Job> getSavedJobs(String talentId) {
        Talent talent = getTalent(talentId);
        if (talent.getSavedJobs() == null || talent.getSavedJobs().isEmpty()) {
            return new ArrayList<>();
        }
        return (List<Job>) jobRepository.findAllById(talent.getSavedJobs());
    }

    public Talent addExperience(String talentId, Experience experience) {
        Talent talent = getTalent(talentId);
        if (talent.getExperience() == null) {
            talent.setExperience(new ArrayList<>());
        }
        sanitizeExperience(experience);
        talent.getExperience().add(experience);
        return talentRepository.save(talent);
    }

    public Talent updateExperience(String talentId, int index, Experience experience) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getExperience(), index, "Experience");
        sanitizeExperience(experience);
        talent.getExperience().set(index, experience);
        return talentRepository.save(talent);
    }

    public Talent deleteExperience(String talentId, int index) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getExperience(), index, "Experience");
        talent.getExperience().remove(index);
        return talentRepository.save(talent);
    }

    public Talent addProject(String talentId, Project project) {
        Talent talent = getTalent(talentId);
        if (talent.getProjects() == null) {
            talent.setProjects(new ArrayList<>());
        }
        sanitizeProject(project);
        talent.getProjects().add(project);
        return talentRepository.save(talent);
    }

    public Talent updateProject(String talentId, int index, Project project) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getProjects(), index, "Project");
        sanitizeProject(project);
        talent.getProjects().set(index, project);
        return talentRepository.save(talent);
    }

    public Talent deleteProject(String talentId, int index) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getProjects(), index, "Project");
        talent.getProjects().remove(index);
        return talentRepository.save(talent);
    }

    public Talent addCertification(String talentId, Certification certification) {
        Talent talent = getTalent(talentId);
        if (talent.getCertifications() == null) {
            talent.setCertifications(new ArrayList<>());
        }
        sanitizeCertification(certification);
        talent.getCertifications().add(certification);
        return talentRepository.save(talent);
    }

    public Talent updateCertification(String talentId, int index, Certification certification) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getCertifications(), index, "Certification");
        sanitizeCertification(certification);
        talent.getCertifications().set(index, certification);
        return talentRepository.save(talent);
    }

    public Talent deleteCertification(String talentId, int index) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getCertifications(), index, "Certification");
        talent.getCertifications().remove(index);
        return talentRepository.save(talent);
    }

    public Talent addAchievement(String talentId, Achievement achievement) {
        Talent talent = getTalent(talentId);
        if (talent.getAchievements() == null) {
            talent.setAchievements(new ArrayList<>());
        }
        sanitizeAchievement(achievement);
        talent.getAchievements().add(achievement);
        return talentRepository.save(talent);
    }

    public Talent updateAchievement(String talentId, int index, Achievement achievement) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getAchievements(), index, "Achievement");
        sanitizeAchievement(achievement);
        talent.getAchievements().set(index, achievement);
        return talentRepository.save(talent);
    }

    public Talent deleteAchievement(String talentId, int index) {
        Talent talent = getTalent(talentId);
        validateIndex(talent.getAchievements(), index, "Achievement");
        talent.getAchievements().remove(index);
        return talentRepository.save(talent);
    }

    public Talent getFullProfile(String talentId) {
        Talent talent = getTalent(talentId);

        if (talent.getExperience() == null)
            talent.setExperience(new ArrayList<>());
        if (talent.getProjects() == null)
            talent.setProjects(new ArrayList<>());
        if (talent.getCertifications() == null)
            talent.setCertifications(new ArrayList<>());
        if (talent.getAchievements() == null)
            talent.setAchievements(new ArrayList<>());
        if (talent.getSkills() == null)
            talent.setSkills(new ArrayList<>());
        if (talent.getResumeSummary() == null)
            talent.setResumeSummary("");
        if (talent.getLinkedinUrl() == null)
            talent.setLinkedinUrl("");
        if (talent.getGithubUrl() == null)
            talent.setGithubUrl("");

        return talent;
    }

    public void validateOwnership(String talentId, String requesterId) {
        if (requesterId == null) {
            throw new RuntimeException("Access denied: authentication required");
        }
        if (!talentId.equals(requesterId)) {
            throw new RuntimeException("Access denied: you can only modify your own profile");
        }
    }

    private void updateTalentFromDTO(Talent talent, TalentDTO dto) {
        if (dto.getName() != null)
            talent.setName(dto.getName());
        if (dto.getUser() != null)
            talent.setUser(dto.getUser());
        if (dto.getUniversity() != null)
            talent.setUniversity(dto.getUniversity());
        if (dto.getMajor() != null)
            talent.setMajor(dto.getMajor());
        if (dto.getGraduationYear() != null)
            talent.setGraduationYear(dto.getGraduationYear());
        if (dto.getCgpa() != null)
            talent.setCgpa(dto.getCgpa());
        if (dto.getSkills() != null)
            talent.setSkills(dto.getSkills());
        if (dto.getLinkedinUrl() != null)
            talent.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getGithubUrl() != null)
            talent.setGithubUrl(dto.getGithubUrl());
        if (dto.getPortfolioUrl() != null)
            talent.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getBio() != null)
            talent.setBio(SanitizationUtil.sanitizePlainText(dto.getBio()));
        if (dto.getLocation() != null)
            talent.setLocation(dto.getLocation());
        if (dto.getPreferredLocations() != null)
            talent.setPreferredLocations(dto.getPreferredLocations());
        if (dto.getPreferredIndustries() != null)
            talent.setPreferredIndustries(dto.getPreferredIndustries());

        if (dto.getExperience() != null) {
            dto.getExperience().forEach(this::sanitizeExperience);
            talent.setExperience(dto.getExperience());
        }
        if (dto.getProjects() != null) {
            dto.getProjects().forEach(this::sanitizeProject);
            talent.setProjects(dto.getProjects());
        }
        if (dto.getCertifications() != null) {
            dto.getCertifications().forEach(this::sanitizeCertification);
            talent.setCertifications(dto.getCertifications());
        }
        if (dto.getAchievements() != null) {
            dto.getAchievements().forEach(this::sanitizeAchievement);
            talent.setAchievements(dto.getAchievements());
        }
        if (dto.getResumeSummary() != null)
            talent.setResumeSummary(
                    SanitizationUtil.sanitizePlainText(dto.getResumeSummary()));
    }

    private void validateIndex(List<?> list, int index, String fieldName) {
        if (list == null || index < 0 || index >= list.size()) {
            throw new RuntimeException(
                    fieldName + " at index " + index + " not found");
        }
    }

    private void sanitizeExperience(Experience exp) {
        if (exp.getBulletPoints() != null) {
            exp.setBulletPoints(SanitizationUtil.sanitizeStringList(exp.getBulletPoints()));
        }
    }

    private void sanitizeProject(Project proj) {
        if (proj.getDescription() != null) {
            proj.setDescription(SanitizationUtil.sanitizePlainText(proj.getDescription()));
        }
        if (proj.getHighlights() != null) {
            proj.setHighlights(SanitizationUtil.sanitizeStringList(proj.getHighlights()));
        }
    }

    private void sanitizeCertification(Certification cert) {
        if (cert.getName() != null) {
            cert.setName(SanitizationUtil.sanitizePlainText(cert.getName()));
        }
    }

    private void sanitizeAchievement(Achievement ach) {
        if (ach.getTitle() != null) {
            ach.setTitle(SanitizationUtil.sanitizePlainText(ach.getTitle()));
        }
        if (ach.getDescription() != null) {
            ach.setDescription(SanitizationUtil.sanitizePlainText(ach.getDescription()));
        }
    }
}
