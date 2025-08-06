package com.miles.maze.mazescape.dto;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class LeaderBoardCreateDto {
        private String playerId;
        private String playerName;
        private Integer score;
        private Integer timePlayed;


}
