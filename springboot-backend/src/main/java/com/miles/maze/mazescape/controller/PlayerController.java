package com.miles.maze.mazescape.controller;

import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.repository.PlayerRepository;
import com.miles.maze.mazescape.service.PlayerService;
import com.miles.maze.mazescape.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/player")
public class PlayerController {

    @Autowired
    private PlayerService playerService;
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private JwtUtil jwtUtil;

    // 註冊
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Player player) {
        if (playerRepository.existsByAccount(player.getAccount())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("帳號已存在，請更換帳號");
        }
        playerService.register(player.getName(), player.getAccount(), player.getPassword());
        return ResponseEntity.ok("註冊成功");
    }

    // 登入
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Player loginData) {
        Player found = playerService.login(loginData.getAccount(), loginData.getPassword());
        if (found != null) {
            String token = jwtUtil.generateToken(found.getAccount());
            Map<String, Object> response = new HashMap<>();
            response.put("playerId", found.getId());
            response.put("name", found.getName());
            response.put("token", token);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("帳號或密碼錯誤");
        }
    }
}
