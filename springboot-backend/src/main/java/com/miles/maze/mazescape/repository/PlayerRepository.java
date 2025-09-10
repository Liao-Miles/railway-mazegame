package com.miles.maze.mazescape.repository;


import com.miles.maze.mazescape.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    boolean existsByAccount(String  account);
    Player findByAccount(String  account);
    Player findByAccountAndPassword(String  account, String password);


}