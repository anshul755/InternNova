package com.internNova.InternNova.repository;

import java.time.LocalDate;
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

    @Query("{'isDeleted': false, 'status': ?0, $or: [{'applicationDeadline': null}, {'applicationDeadline': {$gte: ?1}}]}")
    List<Job> findOpenJobsByStatus(String status, LocalDate today);

    @Query("{'isDeleted': false, 'status': ?0, $or: [{'applicationDeadline': null}, {'applicationDeadline': {$gte: ?1}}]}")
    Page<Job> findOpenJobsByStatus(String status, LocalDate today, Pageable pageable);

    List<Job> findByIsDeletedFalseAndStatusAndApplicationDeadlineBefore(String status, java.time.LocalDate date);

    Optional<Job> findByIdAndIsDeletedFalse(String id);

    List<Job> findByCompanyIdAndIsDeletedFalse(String companyId);

    Page<Job> findByCompanyIdAndIsDeletedFalse(String companyId, Pageable pageable);

    @Query("{'isDeleted': false, 'status': 'ACTIVE', 'jobType': ?0, $or: [{'applicationDeadline': null}, {'applicationDeadline': {$gte: ?1}}]}")
    Page<Job> findOpenJobsByJobType(OpportunityType jobType, LocalDate today, Pageable pageable);

    @Query("{'isDeleted': false, 'status': 'ACTIVE', 'location': {$regex: ?0, $options: 'i'}, $or: [{'applicationDeadline': null}, {'applicationDeadline': {$gte: ?1}}]}")
    Page<Job> findOpenJobsByLocationContainingIgnoreCase(String location, LocalDate today, Pageable pageable);

    @Query("{'isDeleted': false, 'status': 'ACTIVE', $and: [{$or: [{'applicationDeadline': null}, {'applicationDeadline': {$gte: ?1}}]}, {$or: [{'title': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}, {'skillsRequired': {$in: [?0]}}]}]}")
    Page<Job> searchOpenJobs(String keyword, LocalDate today, Pageable pageable);
    
    long countByCompanyIdAndIsDeletedFalse(String companyId);
}
