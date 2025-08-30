package com.miles.maze.mazescape.controller;

import com.miles.maze.mazescape.dto.PlayerAchievementsDTO;
import com.miles.maze.mazescape.entity.Achievement;
import com.miles.maze.mazescape.entity.PlayerAchievement;
import com.miles.maze.mazescape.service.AchievementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public List<Achievement> getAllAchievements() {
        return achievementService.getAllAchievements();
    }

    @GetMapping("/player/{playerId}")
    public List<PlayerAchievement> getPlayerAchievements(@PathVariable Long playerId) {
        return achievementService.getPlayerAchievements(playerId);
    }

    @PostMapping("/unlock")
    public Map<String, Object> unlockAchievement(@RequestBody Map<String, Object> payload) {
        Long playerId = Long.valueOf(payload.get("playerId").toString());
        String achievementName = payload.get("achievementName").toString();
        boolean unlocked = achievementService.unlockAchievement(playerId, achievementName);
        return Map.of("success", unlocked);
    }

    @GetMapping("/player/{playerId}/achievements")
    public PlayerAchievementsDTO getPlayerAchievementsDTO(@PathVariable Long playerId) {
        return achievementService.getPlayerAchievementsDTO(playerId);
    }
}
