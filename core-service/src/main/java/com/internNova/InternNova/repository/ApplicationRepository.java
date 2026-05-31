package com.internNova.InternNova.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.internNova.InternNova.entity.Application;
import com.internNova.InternNova.enums.ApplicationState;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    List<Application> findByIsDeletedFalse();
    
    Optional<Application> findByIdAndIsDeletedFalse(String id);
    
    List<Application> findByJobIdAndIsDeletedFalse(String jobId);
    
    Page<Application> findByJobIdAndIsDeletedFalse(String jobId, Pageable pageable);
    
    List<Application> findByStudentIdAndIsDeletedFalse(String studentId);
    
    Page<Application> findByStudentIdAndIsDeletedFalse(String studentId, Pageable pageable);
    
    Optional<Application> findByJobIdAndStudentIdAndIsDeletedFalse(String jobId, String studentId);
    
    List<Application> findByJobIdAndStatusAndIsDeletedFalse(String jobId, ApplicationState status);
    
    long countByJobIdAndIsDeletedFalse(String jobId);
    
    long countByStudentIdAndIsDeletedFalse(String studentId);
    
    boolean existsByJobIdAndStudentIdAndIsDeletedFalse(String jobId, String studentId);
}