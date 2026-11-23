package com.minijira.backend.dto;

import com.minijira.backend.entity.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    // Optional when creating (defaults to TODO if left null)
    private Status status;
}