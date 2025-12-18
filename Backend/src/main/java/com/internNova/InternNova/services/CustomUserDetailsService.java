package com.internNova.InternNova.services;

import com.internNova.InternNova.entity.Talent;
import com.internNova.InternNova.repository.TalentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private TalentRepository talentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Talent talent = talentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (talent.isDeleted()) {
            throw new UsernameNotFoundException("User account is deleted.");
        }

        String roleName = "ROLE_" + talent.getUser().name();

        return new User(
                talent.getEmail(),
                talent.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName)));
    }
}
