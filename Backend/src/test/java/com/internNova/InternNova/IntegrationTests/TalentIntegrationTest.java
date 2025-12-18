package com.internNova.InternNova.IntegrationTests;

import com.internNova.InternNova.dto.TalentDTO;
import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.enums.User;
import com.internNova.InternNova.repository.TalentRepository;
import com.internNova.InternNova.services.TalentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class TalentIntegrationTest {

    @Autowired
    private TalentService talentService;

    @Autowired
    private TalentRepository talentRepository;

    private TalentDTO createTalentDTO(String email, String name) {
        TalentDTO dto = new TalentDTO();
        dto.setName(name);
        dto.setEmail(email);
        dto.setUser(User.Talent);
        dto.setUniversity("Testing University");
        dto.setMajor("CSE");
        dto.setGraduationYear("2027");
        dto.setCgpa(9.0);
        dto.setSkills(Collections.singletonList("Java"));
        dto.setLinkedinUrl("https://linkedin.com/in/" + name);
        dto.setGithubUrl("https://github.com/" + name);
        return dto;
    }

    private Talent getOrCreateTalent(String email, String name) throws IOException {
        return talentRepository.findByEmail(email).orElseGet(() -> {
            try {
                return talentService.createTalent(createTalentDTO(email, name), "aaa", null, null);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void testCreateTalent() throws IOException {
        String email = "t1@test.com";
        if (talentRepository.findByEmail(email).isEmpty()) {
            TalentDTO dto = createTalentDTO(email, "tester_create");
            Talent created = talentService.createTalent(dto, "StrongPassword123", null, null);

            assertThat(created.getId()).isNotNull();
            assertThat(created.getEmail()).isEqualTo(email);
        } else {
            System.out.println("Skipping CREATE verification as user " + email + " already exists.");
        }
    }

    @Test
    void testCreateDuplicateEmail() throws IOException {
        String email = "duplicate@test.com";
        getOrCreateTalent(email, "dupUser");

        assertThat(talentRepository.findByEmail(email)).isPresent();

        TalentDTO dto2 = createTalentDTO(email, "dupUser2");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            talentService.createTalent(dto2, "StrongPassword123", null, null);
        });

        assertThat(exception.getMessage()).isEqualTo("Email already in use");
    }

    @Test
    void testGetTalent() throws IOException {
        Talent created = getOrCreateTalent("get@test.com", "getter");

        Talent retrieved = talentService.getTalent(created.getId());
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getId()).isEqualTo(created.getId());
        assertThat(retrieved.getEmail()).isEqualTo("get@test.com");
    }

    @Test
    void testUpdateTalent() throws IOException {
        Talent created = getOrCreateTalent("test_delete@test.com", "deleter");

        if (created.isDeleted()) {
            created.setDeleted(false);
            talentRepository.save(created);
        }

        TalentDTO updateDto = new TalentDTO();
        updateDto.setName("TESTER");

        Talent updated = talentService.updateTalent(created.getId(), updateDto, null, null, null);
        assertThat(updated.getName()).isEqualTo("TESTER");

        Talent fromDb = talentRepository.findById(created.getId()).orElse(null);
        assertThat(fromDb).isNotNull();
        assertThat(fromDb.getName()).isEqualTo("TESTER");
    }

    @Test
    void testDeleteTalent() throws IOException {
        Talent created = getOrCreateTalent("duplicate@test.com", "UPDATED");

        if (created.isDeleted()) {
            created.setDeleted(false);
            talentRepository.save(created);
        }

        talentService.deleteTalent(created.getId());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            talentService.getTalent(created.getId());
        });
        assertThat(exception.getMessage()).isEqualTo("Talent not found");

        Talent fromDb = talentRepository.findById(created.getId()).orElse(null);
        assertThat(fromDb).isNotNull();
        assertThat(fromDb.isDeleted()).isTrue();
    }
}
