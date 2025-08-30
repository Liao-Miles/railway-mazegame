package com.miles.maze.mazescape.repository;

import com.miles.maze.mazescape.entity.PlayerAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerAchievementRepository extends JpaRepository<PlayerAchievement, Long> {
    List<PlayerAchievement> findByPlayerId(Long playerId);
    boolean existsByPlayerIdAndAchievementId(Long playerId, Long achievementId);
}