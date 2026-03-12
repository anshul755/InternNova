package com.internNova.InternNova.services;

import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.TalentRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class TalentService {

    @Autowired
    private TalentRepository talentRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Talent createTalent(TalentDTO talentDTO, MultipartFile resume, MultipartFile avatar)
            throws IOException {

        Talent talent = new Talent();
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
        Talent talent = talentRepository.findById(id).orElseThrow(() -> new RuntimeException("Talent not found"));
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
            talent.setBio(dto.getBio());
        if (dto.getLocation() != null)
            talent.setLocation(dto.getLocation());
        if (dto.getPreferredLocations() != null)
            talent.setPreferredLocations(dto.getPreferredLocations());
        if (dto.getPreferredIndustries() != null)
            talent.setPreferredIndustries(dto.getPreferredIndustries());
    }
}
