package com.miles.maze.mazescape.dto;

import lombok.Data;
import java.util.List;

@Data
public class PlayerAchievementsDTO {
    private String playerName;
    private String account;
    private List<AchievementDTO> achievements;
}
