package com.miles.maze.mazescape.service;

import com.miles.maze.mazescape.dto.LeaderBoardCreateDto;
import com.miles.maze.mazescape.dto.LeaderBoardDto;
import com.miles.maze.mazescape.entity.LeaderBoard;
import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.repository.LeaderBoardRepository;
import com.miles.maze.mazescape.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeaderBoardService {

    private final LeaderBoardRepository leaderBoardRepository;
    private final PlayerRepository playerRepository;

    public LeaderBoardService(LeaderBoardRepository leaderBoardRepository, PlayerRepository playerRepository) {
        this.leaderBoardRepository = leaderBoardRepository;
        this.playerRepository = playerRepository;
    }

    // 取得分數最高的前10筆排行榜
    public List<LeaderBoardDto> getTop10LeaderBoard() {
        List<LeaderBoard> list = leaderBoardRepository.findTop10ByOrderByScoreDesc();
        return list.stream().map(LeaderBoardDto::new).collect(Collectors.toList());
    }

    public void saveLeaderBoard(LeaderBoardCreateDto dto) {
        Player player = playerRepository.findById(Long.valueOf(dto.getPlayerId()))
                .orElseThrow(() -> new RuntimeException("找不到指定的玩家 ID"));

        LeaderBoard lb = new LeaderBoard();
        lb.setPlayer(player);
        lb.setScore(dto.getScore());
        lb.setTimePlayed(dto.getTimePlayed());
        lb.setCreatedAt(LocalDateTime.now());

        leaderBoardRepository.save(lb);
    }

}
