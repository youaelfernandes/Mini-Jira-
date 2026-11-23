package com.minijira.backend.controller;

import com.minijira.backend.dto.ProjectRequest;
import com.minijira.backend.dto.ProjectResponse;
import com.minijira.backend.entity.Project;
import com.minijira.backend.entity.User;
import com.minijira.backend.repository.ProjectRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;

    // Helper: Grabs the authenticated User that JwtAuthFilter placed in SecurityContext
    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // 1. Create a new project owned by the logged-in user
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        User currentUser = getCurrentUser();

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();

        Project saved = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ProjectResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.getCreatedAt()));
    }

    // 2. List ONLY projects belonging to the logged-in user
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        User currentUser = getCurrentUser();

        List<ProjectResponse> projects = projectRepository.findByOwnerId(currentUser.getId())
                .stream()
                .map(p -> new ProjectResponse(p.getId(), p.getName(), p.getDescription(), p.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(projects);
    }

    // 3. Delete a project (only if the logged-in user owns it)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this project");
        }

        projectRepository.delete(project);
        return ResponseEntity.noContent().build();
    }
}