package com.minijira.backend.repository;

import com.minijira.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // Auto-writes: SELECT * FROM projects WHERE owner_id = ?
    List<Project> findByOwnerId(Long ownerId);
}