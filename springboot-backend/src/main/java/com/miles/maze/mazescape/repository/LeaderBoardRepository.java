package com.miles.maze.mazescape.repository;

import com.miles.maze.mazescape.entity.LeaderBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderBoardRepository extends JpaRepository<LeaderBoard, Long> {

    List<LeaderBoard> findTop10ByOrderByScoreDesc();

    List<LeaderBoard> findByPlayerIdOrderByScoreDesc(Long playerId);
}
