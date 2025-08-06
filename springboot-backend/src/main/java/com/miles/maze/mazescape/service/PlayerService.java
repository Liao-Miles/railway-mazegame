package com.miles.maze.mazescape.service;

import com.miles.maze.mazescape.entity.Player;
import com.miles.maze.mazescape.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    public void register(String name,String account, String password) {
        Player newPlayer = new Player(name,account, password);
        playerRepository.save(newPlayer); // 新增一筆玩家
    }

}
