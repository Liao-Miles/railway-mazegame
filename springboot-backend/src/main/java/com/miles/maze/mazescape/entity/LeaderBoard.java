package com.miles.maze.mazescape.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "leaderboard")
public class LeaderBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 與玩家 Player 建立多對一關聯（多筆排行榜紀錄對一個玩家）
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)  // 對應資料庫的 player_id 外鍵欄位
    private Player player;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "time_played", nullable = false)
    private Integer timePlayed; // 遊戲時間(秒)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


}

