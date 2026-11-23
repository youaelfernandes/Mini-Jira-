package com.minijira.backend.dto;

import com.minijira.backend.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Status status;
    private Long projectId;
    private LocalDateTime createdAt;
}