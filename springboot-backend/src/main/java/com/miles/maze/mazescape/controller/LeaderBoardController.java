package com.miles.maze.mazescape.controller;

import com.miles.maze.mazescape.dto.LeaderBoardCreateDto;
import com.miles.maze.mazescape.dto.LeaderBoardDto;
import com.miles.maze.mazescape.service.LeaderBoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
public class LeaderBoardController {


    private final LeaderBoardService leaderBoardService;


    public LeaderBoardController(LeaderBoardService leaderBoardService) {
        this.leaderBoardService = leaderBoardService;
    }

    // API：取得排行榜前10名資料 (JSON)
    @GetMapping("/top10")
    public List<LeaderBoardDto> getTop10LeaderBoard() {
        return leaderBoardService.getTop10LeaderBoard();
    }


    @PostMapping("/submit")
    public ResponseEntity<?> saveLeaderBoard(@RequestBody LeaderBoardCreateDto dto) {
        try {
            leaderBoardService.saveLeaderBoard(dto);
            return ResponseEntity.ok().body("儲存成功");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
