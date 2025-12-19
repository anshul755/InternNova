package com.internNova.InternNova.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.internNova.InternNova.entity.Company;

public interface CompanyRepository extends MongoRepository<Company, String> {
    Optional<Company> findByEmail(String email);

    List<Company> findByIsDeletedFalse();
}
