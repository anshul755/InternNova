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

List<Job> findByIsDeletedFalseAndStatus(String status);

    Page<Job> findByIsDeletedFalseAndStatus(String status, Pageable pageable);

    List<Job> findByIsDeletedFalseAndStatusAndApplicationDeadlineBefore(String status, java.time.LocalDate date);

    Optional<Job> findByIdAndIsDeletedFalse(String id);

    List<Job> findByCompanyIdAndIsDeletedFalse(String companyId);

    Page<Job> findByCompanyIdAndIsDeletedFalse(String companyId, Pageable pageable);

    @Query("{'isDeleted': false, 'status': 'ACTIVE', 'jobType': ?0}")
    Page<Job> findByJobTypeAndStatusActive(OpportunityType jobType, Pageable pageable);

    @Query("{'isDeleted': false, 'status': 'ACTIVE', 'location': {$regex: ?0, $options: 'i'}}")
    Page<Job> findByLocationContainingIgnoreCaseAndStatusActive(String location, Pageable pageable);

    @Query("{'isDeleted': false, 'status': 'ACTIVE', $or: [{'title': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}, {'skillsRequired': {$in: [?0]}}]}")
    Page<Job> searchActiveJobs(String keyword, Pageable pageable);
    
    long countByCompanyIdAndIsDeletedFalse(String companyId);
}