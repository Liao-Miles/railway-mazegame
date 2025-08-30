package com.miles.maze.mazescape.repository;

import com.miles.maze.mazescape.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Achievement findByName(String name);
}
