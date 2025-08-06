package com.miles.maze.mazescape.dto;

import com.miles.maze.mazescape.entity.LeaderBoard;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LeaderBoardDto {
    private final LocalDateTime timestamp;
    private String playerId;
    private String playerName;
    private Integer score;
    private Integer timePlayed;

    public LeaderBoardDto(LeaderBoard lb) {
        this.playerName = lb.getPlayer().getName();
        this.score = lb.getScore();
        this.timePlayed = lb.getTimePlayed();
        this.timestamp = lb.getCreatedAt();
        this.playerId = String.valueOf(lb.getPlayer().getId());
    }
}
