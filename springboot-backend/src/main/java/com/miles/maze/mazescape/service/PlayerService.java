package com.miles.maze.mazescape.service;

import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void register(String name, String account, String password) {
        String encodedPassword = passwordEncoder.encode(password);
        Player newPlayer = new Player(name, account, encodedPassword);
        playerRepository.save(newPlayer); // 新增一筆玩家
    }

    public Player login(String account, String rawPassword) {
        Player player = playerRepository.findByAccount(account);
        if (player != null && passwordEncoder.matches(rawPassword, player.getPassword())) {
            return player;
        }
        return null;
    }

}
