USE railway;
-- 成就 1
insert into achievement (name, description, condition_type, condition_value, points)
values (
           '勝利初體驗',                       -- 成就名稱
           '玩家首次成功通關迷宮遊戲，獲得首次勝利的榮譽。',  -- 成就描述
           'win',                               -- 條件類型（勝利）
           1,                                   -- 條件值（首次完成）
           100                                  -- 成就點數，可自行設定
       );

-- 成就 2
INSERT INTO achievement (name, description, condition_type, condition_value, points)
VALUES (
           '完美主義',                     -- 成就名稱
           '玩家在迷宮遊戲中完美通關，每一步都踩在正確的道路上，沒有失誤。',  -- 成就描述
           'perfect_path',                             -- 條件類型（完美通關）
           1,                                          -- 條件值（1 表示完全沒有踩空）
           150                                         -- 成就點數
       );

-- 成就 3
INSERT INTO achievement (name, description, condition_type, condition_value, points)
VALUES (
           '尋寶者',                                   -- 成就名稱
           '玩家成功蒐集遊戲中的四顆鑽石，展現了卓越的探索能力。',  -- 成就描述
           'collect_gems',                             -- 條件類型（蒐集物品）
           4,                                          -- 條件值（需要收集的鑽石數量）
           200                                         -- 成就點數
       );

-- 成就 4
INSERT INTO achievement (name, description, condition_type, condition_value, points)
VALUES (
           '快還要更快',                               -- 成就名稱
           '玩家在迷宮遊戲中於 30 秒內完成通關，挑戰極限速度。',  -- 成就描述
           'time_limit',                               -- 條件類型（時間限制）
           30,                                         -- 條件值（30 秒內）
           250                                         -- 成就點數
       );

-- 成就 5
insert into achievement (name, description, condition_type, condition_value, points)
values (
           '活著真好',
           '玩家成功通關所有地圖',
           'win_all_maps',
           3,
           50
       );

-- 成就 6
INSERT INTO achievement (name, description, condition_type, condition_value, points, hidden)
VALUES (
           '全靠自己',
           '不進安全屋、不使用提燈直接抵達終點',
           'custom',
           1,           -- custom 類型可以用 1 表示這個成就
           100,
           TRUE         -- 隱藏成就
       );



