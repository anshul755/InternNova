package com.internNova.InternNova.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.internNova.InternNova.entity.Company;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {

    List<Company> findByIsDeletedFalse();
}
