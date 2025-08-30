package com.miles.maze.mazescape.service;

import com.miles.maze.mazescape.dto.AchievementDTO;
import com.miles.maze.mazescape.dto.PlayerAchievementsDTO;
import com.miles.maze.mazescape.entity.Achievement;
import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.entity.PlayerAchievement;
import com.miles.maze.mazescape.repository.AchievementRepository;
import com.miles.maze.mazescape.repository.PlayerAchievementRepository;
import com.miles.maze.mazescape.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AchievementService {
    private final AchievementRepository achievementRepo;
    private final PlayerAchievementRepository playerAchievementRepo;
    private final PlayerRepository playerRepo;

    public AchievementService(AchievementRepository achievementRepo, PlayerAchievementRepository playerAchievementRepo, PlayerRepository playerRepo) {
        this.achievementRepo = achievementRepo;
        this.playerAchievementRepo = playerAchievementRepo;
        this.playerRepo = playerRepo;
    }

    public List<Achievement> getAllAchievements() {
        return achievementRepo.findAll();
    }

    public List<PlayerAchievement> getPlayerAchievements(Long playerId) {

        return playerAchievementRepo.findByPlayerId(playerId);
    }

    public boolean unlockAchievement(Long playerId, String achievementName) {
        System.out.println("[AchievementService] unlockAchievement called: playerId=" + playerId + ", name=" + achievementName);
        Achievement achievement = achievementRepo.findByName(achievementName);
        if (achievement == null) {
            System.out.println("[AchievementService] achievement not found: " + achievementName);
            return false;
        }
        boolean already = playerAchievementRepo.existsByPlayerIdAndAchievementId(playerId, achievement.getId());
        System.out.println("[AchievementService] achievement id=" + achievement.getId() + ", alreadyUnlocked=" + already);
        if (already) return false;

        PlayerAchievement pa = new PlayerAchievement();
        pa.setPlayerId(playerId);
        pa.setAchievementId(achievement.getId());
        pa.setUnlockedAt(LocalDateTime.now());
        playerAchievementRepo.save(pa);
        System.out.println("[AchievementService] saved PlayerAchievement for playerId=" + playerId + ", achievementId=" + achievement.getId());
        return true;
    }

    public PlayerAchievementsDTO getPlayerAchievementsDTO(Long playerId) {
        Player player = playerRepo.findById(playerId).orElse(null);
        if (player == null) return null;

        List<Achievement> allAchievements = achievementRepo.findAll();
        List<PlayerAchievement> unlockedList = playerAchievementRepo.findByPlayerId(playerId);

        Map<Long, PlayerAchievement> unlockedMap = unlockedList.stream()
                .collect(Collectors.toMap(PlayerAchievement::getAchievementId, pa -> pa));

        List<AchievementDTO> achievementDTOs = allAchievements.stream().map(a -> {
            AchievementDTO dto = new AchievementDTO();
            dto.setId(a.getId());
            dto.setName(a.getName());
            dto.setDescription(a.getDescription());
            PlayerAchievement pa = unlockedMap.get(a.getId());
            dto.setUnlocked(pa != null);
            dto.setUnlockedAt(pa != null ? pa.getUnlockedAt() : null);
            return dto;
        }).collect(Collectors.toList());

        PlayerAchievementsDTO result = new PlayerAchievementsDTO();
        result.setPlayerName(player.getName());
        result.setAccount(player.getAccount());
        result.setAchievements(achievementDTOs);
        return result;
    }
}
