package com.internNova.InternNova.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.internNova.InternNova.entity.Job;
import com.internNova.InternNova.enums.OpportunityType;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {

    List<Job> findByIsDeletedFalse();
    
    Page<Job> findByIsDeletedFalse(Pageable pageable);
    
    Optional<Job> findByIdAndIsDeletedFalse(String id);
    
    List<Job> findByCompanyIdAndIsDeletedFalse(String companyId);
    
    Page<Job> findByCompanyIdAndIsDeletedFalse(String companyId, Pageable pageable);
    
    @Query("{'isDeleted': false, 'jobType': ?0}")
    Page<Job> findByJobType(OpportunityType jobType, Pageable pageable);
    
    @Query("{'isDeleted': false, 'location': {$regex: ?0, $options: 'i'}}")
    Page<Job> findByLocationContainingIgnoreCase(String location, Pageable pageable);
    
    @Query("{'isDeleted': false, $or: [{'title': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}, {'skillsRequired': {$in: [?0]}}]}")
    Page<Job> searchJobs(String keyword, Pageable pageable);
    
    long countByCompanyIdAndIsDeletedFalse(String companyId);
}