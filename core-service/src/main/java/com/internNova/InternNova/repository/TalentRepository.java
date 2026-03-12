package com.internNova.InternNova.repository;

import com.internNova.InternNova.entity.Talent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TalentRepository extends MongoRepository<Talent, String> {

}
