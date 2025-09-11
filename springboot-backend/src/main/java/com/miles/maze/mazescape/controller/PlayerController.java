package com.miles.maze.mazescape.controller;

import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.repository.PlayerRepository;
import com.miles.maze.mazescape.service.PlayerService;
import com.miles.maze.mazescape.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
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
    public ResponseEntity<?> login(@RequestBody Player loginData, HttpServletResponse response) {
        Player found = playerService.login(loginData.getAccount(), loginData.getPassword());
        if (found != null) {
            String accessToken = jwtUtil.generateAccessToken(found.getAccount());
            String refreshToken = jwtUtil.generateRefreshToken(found.getAccount());
            // 設置 HttpOnly + Secure Cookie
            Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(true); // 若本地測試可視情況設為 false
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(60 * 60 * 24 * 14); // 14天
            response.addCookie(refreshCookie);
            Map<String, Object> res = new HashMap<>();
            res.put("playerId", found.getId());
            res.put("name", found.getName());
            res.put("accessToken", accessToken);
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("帳號或密碼錯誤");
        }
    }

    // 用 refresh token 兌換 access token
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !jwtUtil.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token 無效或過期");
        }
        String account = jwtUtil.extractAccount(refreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(account);
        Map<String, Object> res = new HashMap<>();
        res.put("accessToken", newAccessToken);
        return ResponseEntity.ok(res);
    }

    // 登出
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true); // 本地測試時設為 false
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0); // 立即過期
        response.addCookie(refreshCookie);
        return ResponseEntity.ok("已登出");
    }
}
