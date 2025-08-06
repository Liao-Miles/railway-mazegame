package com.miles.maze.mazescape.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "player", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account"})
})
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String account;

    private String password;
    private String name;

    public Player() {}

    public Player(String name, String account, String password) {
        this.name = name;
        this.account = account;
        this.password = password;
    }


}
