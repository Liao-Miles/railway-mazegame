package com.miles.maze.mazescape.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/")
    public String home() {
        return "MazeGame Spring Boot 後端已啟動！";
    }
}

