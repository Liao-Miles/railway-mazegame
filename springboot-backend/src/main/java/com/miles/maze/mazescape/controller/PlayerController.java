package com.miles.maze.mazescape.controller;

import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/player")
public class    PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    // 註冊
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Player player) {
        if (playerRepository.existsByAccount(player.getAccount())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("帳號已存在，請更換帳號");
        }
        playerRepository.save(player);
        return ResponseEntity.ok("註冊成功");
    }

    // 登入
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Player loginData) {
        Player found = playerRepository.findByAccountAndPassword(
                loginData.getAccount(), loginData.getPassword());

        if (found != null) {
            // 用 Map 組成簡單 JSON 結構
            Map<String, Object> response = new HashMap<>();
            response.put("playerId", found.getId());
            response.put("name", found.getName());

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("帳號或密碼錯誤");
        }
    }
}

