package com.internNova.InternNova.controller;

import com.internNova.InternNova.client.AiPipelineClient;
import com.internNova.InternNova.dto.GenerateResumeRequestDTO;
import com.internNova.InternNova.dto.GenerateResumeResponseDTO;
import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.entity.*;
import com.internNova.InternNova.services.TalentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/talent/v1")
public class TalentController {

    @Autowired
    private TalentService talentService;

    @Autowired
    private AiPipelineClient aiPipelineClient;

    @Value("${service.internal-token}")
    private String internalToken;

    private String getAuthUserId(HttpServletRequest request) {
        return (String) request.getAttribute("userId");
    }

    private void validateOwnership(String talentId, HttpServletRequest request) {
        String userId = getAuthUserId(request);
        talentService.validateOwnership(talentId, userId);
    }

    private boolean isInternalServiceCall(HttpServletRequest request) {
        String token = request.getHeader("X-Service-Token");
        return token != null && token.equals(internalToken);
    }

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
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            HttpServletRequest request) {
        try {
            validateOwnership(id, request);
            Talent updatedTalent = talentService.updateTalent(id, talentDTO,
                    resume, avatar);
            return ResponseEntity.ok(updatedTalent);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("Access denied")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTalent(@PathVariable String id,
                                             HttpServletRequest request) {
        try {
            validateOwnership(id, request);
            talentService.deleteTalent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("Access denied")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/saved-jobs/{jobId}")
    public ResponseEntity<Talent> saveJob(@PathVariable String id,
                                          @PathVariable String jobId,
                                          HttpServletRequest request) {
        try {
            validateOwnership(id, request);
            Talent talent = talentService.saveJob(id, jobId);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("Access denied")) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/saved-jobs/{jobId}")
    public ResponseEntity<Talent> removeSavedJob(@PathVariable String id,
                                                 @PathVariable String jobId,
                                                 HttpServletRequest request) {
        try {
            validateOwnership(id, request);
            Talent talent = talentService.removeSavedJob(id, jobId);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("Access denied")) {
                return ResponseEntity.status(403).build();
            }
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

    @PostMapping("/experience")
    public ResponseEntity<?> addExperience(@RequestBody Experience experience,
                                            HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            talentService.validateOwnership(userId, userId);
            Talent talent = talentService.addExperience(userId, experience);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PutMapping("/experience/{index}")
    public ResponseEntity<?> updateExperience(@PathVariable int index,
                                               @RequestBody Experience experience,
                                               HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.updateExperience(userId, index, experience);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @DeleteMapping("/experience/{index}")
    public ResponseEntity<?> deleteExperience(@PathVariable int index,
                                               HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.deleteExperience(userId, index);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> addProject(@RequestBody Project project,
                                         HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.addProject(userId, project);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PutMapping("/projects/{index}")
    public ResponseEntity<?> updateProject(@PathVariable int index,
                                            @RequestBody Project project,
                                            HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.updateProject(userId, index, project);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @DeleteMapping("/projects/{index}")
    public ResponseEntity<?> deleteProject(@PathVariable int index,
                                            HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.deleteProject(userId, index);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PostMapping("/certifications")
    public ResponseEntity<?> addCertification(@RequestBody Certification certification,
                                               HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.addCertification(userId, certification);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PutMapping("/certifications/{index}")
    public ResponseEntity<?> updateCertification(@PathVariable int index,
                                                  @RequestBody Certification certification,
                                                  HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.updateCertification(userId, index, certification);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @DeleteMapping("/certifications/{index}")
    public ResponseEntity<?> deleteCertification(@PathVariable int index,
                                                  HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.deleteCertification(userId, index);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PostMapping("/achievements")
    public ResponseEntity<?> addAchievement(@RequestBody Achievement achievement,
                                             HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.addAchievement(userId, achievement);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @PutMapping("/achievements/{index}")
    public ResponseEntity<?> updateAchievement(@PathVariable int index,
                                                @RequestBody Achievement achievement,
                                                HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.updateAchievement(userId, index, achievement);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @DeleteMapping("/achievements/{index}")
    public ResponseEntity<?> deleteAchievement(@PathVariable int index,
                                                HttpServletRequest request) {
        try {
            String userId = getAuthUserId(request);
            if (userId == null) return authRequired();
            Talent talent = talentService.deleteAchievement(userId, index);
            return ResponseEntity.ok(talent);
        } catch (RuntimeException e) {
            return handleError(e);
        }
    }

    @GetMapping("/profile/{talentId}/full")
    public ResponseEntity<?> getFullProfile(@PathVariable String talentId,
                                             HttpServletRequest request) {
        if (isInternalServiceCall(request)) {
            try {
                Talent talent = talentService.getFullProfile(talentId);
                return ResponseEntity.ok(talent);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }

        String userId = getAuthUserId(request);
        if (userId != null) {
            try {
                Talent talent = talentService.getFullProfile(talentId);
                return ResponseEntity.ok(talent);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }

        return ResponseEntity.status(401).body(
                "{\"success\":false,\"message\":\"Authentication required\"}");
    }

    @PostMapping("/resume")
    public ResponseEntity<?> generateResume(@RequestBody GenerateResumeRequestDTO body,
                                            HttpServletRequest request) {
        String userId = getAuthUserId(request);
        if (userId == null) return authRequired();
        // Trust the authenticated user — never let the client choose whose resume to build.
        body.setTalentId(userId);
        try {
            GenerateResumeResponseDTO result = aiPipelineClient.generateResume(body);
            return ResponseEntity.ok(result);
        } catch (RestClientResponseException e) {
            // Surface the AI service's status + message (404 no profile, 502 compile failed).
            String message = e.getResponseBodyAsString();
            try {
                var node = new ObjectMapper().readTree(message);
                if (node.has("detail")) message = node.get("detail").asText();
            } catch (Exception ignored) {
            }
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("success", false, "message", message));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                    "success", false,
                    "message", "Resume service is unavailable. Please try again."));
        }
    }

    private ResponseEntity<String> authRequired() {
        return ResponseEntity.status(401).body(
                "{\"success\":false,\"message\":\"Authentication required\"}");
    }

    private ResponseEntity<?> handleError(RuntimeException e) {
        String msg = e.getMessage();
        if (msg != null && msg.startsWith("Access denied")) {
            return ResponseEntity.status(403).body(
                    "{\"success\":false,\"message\":\"" + msg + "\"}");
        }
        if (msg != null && msg.contains("not found")) {
            return ResponseEntity.status(404).body(
                    "{\"success\":false,\"message\":\"" + msg + "\"}");
        }
        return ResponseEntity.badRequest().body(
                "{\"success\":false,\"message\":\"" + msg + "\"}");
    }
}
