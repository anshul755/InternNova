package com.internNova.InternNova.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.internNova.InternNova.entity.AuthUser;

@Repository
public interface AuthUserRepository extends MongoRepository<AuthUser, String> {
}
