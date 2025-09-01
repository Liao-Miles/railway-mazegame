-- auto-generated definition
USE railway;

create table player
(
    Id       int(50) unsigned auto_increment
        primary key,
    name     varchar(50)  not null,
    account  varchar(50)  not null,
    password varchar(100) not null,
    constraint account
        unique (account)
);


-- auto-generated definition
create table leaderboard
(
    id          int unsigned auto_increment
        primary key,
    player_id   int(50) unsigned not null,
    score       int              not null,
    time_played int              not null,
    created_at  datetime         not null,
    constraint fk_player
        foreign key (player_id) references player (Id)
            on update cascade on delete cascade
);

create table achievement
(
    id            int unsigned auto_increment primary key,
    name          varchar(100) not null,       -- 成就名稱（例如：速通達人）
    description   text not null,               -- 成就描述（例如：50秒內通關）
    condition_type varchar(50) not null,       -- 條件類型（time、score、diamond、custom）
    condition_value int not null,              -- 條件值（例如：time=50秒、diamond=4顆）
    points        int default 0,               -- 成就點數/獎勵
    created_at    datetime default current_timestamp
);


create table player_achievement
(
    id              int unsigned auto_increment primary key,
    player_id       int unsigned not null,
    achievement_id  int unsigned not null,
    unlocked_at     datetime default current_timestamp,
    constraint fk_player_achievement_player
        foreign key (player_id) references player (Id)
            on update cascade on delete cascade,
    constraint fk_player_achievement_achievement
        foreign key (achievement_id) references achievement (id)
            on update cascade on delete cascade,
    unique (player_id, achievement_id) -- 防止同一個成就被解鎖兩次
);

ALTER TABLE achievement
    ADD COLUMN hidden BOOLEAN DEFAULT FALSE COMMENT 'TRUE = 未解鎖前顯示???';


