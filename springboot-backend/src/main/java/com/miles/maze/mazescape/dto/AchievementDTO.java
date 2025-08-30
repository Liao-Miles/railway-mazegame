package com.miles.maze.mazescape.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AchievementDTO {
    private Long id;
    private String name;
    private String description;
    private boolean unlocked;
    private LocalDateTime unlockedAt;
}