package com.internNova.InternNova.controller;

import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.services.TalentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import com.internNova.InternNova.entity.Job;

@RestController
@RequestMapping("/talent/v1")
public class TalentController {

    @Autowired
    private TalentService talentService;

    @PostMapping
    public ResponseEntity<Talent> createTalent(
            @RequestPart("data") TalentDTO talentDTO,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        try {
            Talent talent = talentService.createTalent(talentDTO, resume, avatar);
            return ResponseEntity.ok(talent);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Talent> getTalent(@PathVariable String id) {
        try {
            Talent talent = talentService.getTalent(id);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Talent> updateTalent(
            @PathVariable String id,
            @RequestPart("data") TalentDTO talentDTO,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        try {
            Talent updatedTalent = talentService.updateTalent(id, talentDTO,
                    resume, avatar);
            return ResponseEntity.ok(updatedTalent);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTalent(@PathVariable String id) {
        try {
            talentService.deleteTalent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/saved-jobs/{jobId}")
    public ResponseEntity<Talent> saveJob(@PathVariable String id, @PathVariable String jobId) {
        try {
            Talent talent = talentService.saveJob(id, jobId);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/saved-jobs/{jobId}")
    public ResponseEntity<Talent> removeSavedJob(@PathVariable String id, @PathVariable String jobId) {
        try {
            Talent talent = talentService.removeSavedJob(id, jobId);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/saved-jobs")
    public ResponseEntity<List<Job>> getSavedJobs(@PathVariable String id) {
        try {
            List<Job> jobs = talentService.getSavedJobs(id);
            return ResponseEntity.ok(jobs);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
