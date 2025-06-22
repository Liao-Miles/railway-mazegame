window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const startTime = parseInt(params.get('start') || Date.now());
    const elapsed = Date.now() - startTime;

    console.log(`音效排程開始，已延遲 ${elapsed}ms`);

    const tryPlay = () => {
        if (window.SoundManager.allLoaded) {
            window.SoundManager.startGameAudio(elapsed);
        } else {
            console.log('等待音效載入中...');
            setTimeout(tryPlay, 100);
        }
    };

    tryPlay();
});


let isGameStarted = false;

let player = {
    x: 0,
    y: 14,
};

const respawnPoint = {
    x: 0,
    y: 14
};

const seenTiles = Array(15).fill(0).map(() => Array(25).fill(false)); // 地圖高15寬25   


let lightuse = 10;

let diamondCount = 0; // 吃了幾顆

//0是死路 1是路 2是終點 3是安全屋 4是鑽石(加分)
const map1 = [
    [4, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 3, 0, 1, 1, 0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 3, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 4, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 4, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 3, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]
];

const map2 = [
    [1, 1, 1, 0, 0, 0, 1, 1, 4, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 2],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [0, 3, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 4, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 0, 1, 0, 4, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1],
    [0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1]
];

const map3 = [
    [0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2],
    [1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 4, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 0, 1, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 4],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 0, 4, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 3, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 4, 1, 0, 0, 1, 1, 1, 0, 0, 0]
];

const maps = [map1, map2, map3];

// 隨機選一張地圖
const randomIndex = Math.floor(Math.random() * maps.length);
const currentMap = maps[randomIndex];
const grid = document.getElementById('grid');

function createGrid() {
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 25; x++) {
            const cell = document.createElement('div');//
            cell.className = 'cell'; //讓每個cell都帶有.cell
            cell.dataset.x = x; // x座標 0 - 24
            cell.dataset.y = y; // y座標 0 - 14

            const value = currentMap[y][x];//map1[行][列] 
            if (value === 0) cell.classList.add('dead');
            else if (value === 1) cell.classList.add('path');
            else if (value === 2) cell.classList.add('end');
            else if (value === 3) cell.classList.add('house');
            else if (value === 4) cell.classList.add('diamond');

            if (x === player.x && y === player.y) {
                cell.classList.add('player');
            }

            const overlay = document.createElement('div');
            overlay.className = 'overlay';

            cell.appendChild(overlay);
            grid.appendChild(cell);//把一個元素「放進」另一個元素裡。
        }
    }
    updatePlayerCell();
}

function updatePlayerCell() {
    // 先清除所有現有的 player 樣式，避免多個player出現
    document.querySelectorAll('.player').forEach(function (cell) {
        cell.classList.remove('player');
    });

    // 再給新的位置加 player類別 
    const cell = document.querySelector(`.cell[data-x="${player.x}"][data-y="${player.y}"]`);
    if (cell) {
        cell.classList.add('player');

        cell.classList.remove('dimmed');//讓目前位置亮起
        const overlay = cell.querySelector('.overlay');
        if (overlay) overlay.style.display = 'none';
    }
}


let lastMoveTime = 0;
const moveCooldown = 100;

window.addEventListener('keydown', handlePlayerMove);

function handlePlayerMove(event) {
    if (!isGameStarted || isGameOver || isPaused) return;

    const now = Date.now();
    if (now - lastMoveTime < moveCooldown) return;
    lastMoveTime = now;

    // 你的按鍵判斷及玩家移動邏輯
    let newX = player.x;
    let newY = player.y;

    const key = event.key.toLowerCase();

    if (key === "w") newY -= 1;
    else if (key === "s") newY += 1;
    else if (key === "a") newX -= 1;
    else if (key === "d") newX += 1;
    else if (key === "f") {
        light();
        return;
    }
    else return;

    // 邊界判斷
    if (newX < 0 || newX >= 25 || newY < 0 || newY >= 15) {
        return;
    }

    // 傳回起點
    // 踩到牆，仍要記錄這格被看過
    if (currentMap[newY][newX] == 0) {
        seenTiles[newY][newX] = true;

        const wallCell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
        if (wallCell) {
            wallCell.classList.remove('dimmed');
            const overlay = wallCell.querySelector('.overlay');
            if (overlay) overlay.style.display = 'none';
        }

        player.x = respawnPoint.x;
        player.y = respawnPoint.y;
        updatePlayerCell();
        return;
    }



    // 走過的路標示
    const oldCell = document.querySelector(`.cell[data-x="${player.x}"][data-y="${player.y}"]`);
    if (oldCell && !oldCell.classList.contains('end')) {
        oldCell.classList.remove('dimmed');
        const overlay = oldCell.querySelector('.overlay');
        if (overlay) overlay.style.display = 'none';
    }

    // 更新玩家座標
    player.x = newX;
    player.y = newY;

    //  踩到鑽石（地圖值為 4）
    if (currentMap[newY][newX] === 4) {
        diamondCount++;                     // 吃一顆
        currentMap[newY][newX] = 1;         // 改成路，移除鑽石

        // 更新地圖顯示
        const diamondCell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
        if (diamondCell) {
            diamondCell.classList.remove('diamond');
            diamondCell.classList.add('path'); //  補上這行，讓這格「亮起來」
            const overlay = diamondCell.querySelector('.overlay');
            if (overlay) overlay.style.display = 'none';
        };

        // 更新畫面上的顯示
        const diamondStatus = document.getElementById('diamond-status');
        if (diamondStatus) {
            diamondStatus.innerText = `鑽石：${diamondCount} / 4`;
        }
    }

    updatePlayerCell();

    // 判斷是否遇到怪物
    checkCollision();

    // 檢查預警
    checkWarning();
    checkWarning2();
    checkWarning3();


    // 判斷是否到終點
    if (currentMap[newY][newX] === 2) {
        winGame();
    }

    checkHouseTrigger(); // 判斷是否觸發安全屋
}

//提燈功能
function light() {
    if (lightuse == 0) return;

    lightuse--;

    const directions = [
        { dx: 0, dy: 0 },   // 自己
        { dx: 1, dy: 0 },   // 右
        { dx: -1, dy: 0 },  // 左
        { dx: 0, dy: -1 },  // 上
        { dx: 0, dy: 1 },   // 下
        { dx: 1, dy: -1 },  // 右上
        { dx: -1, dy: -1 }, // 左上
        { dx: 1, dy: 1 },   // 右下
        { dx: -1, dy: 1 }   // 左下
    ];

    directions.forEach(dir => {
        const nx = player.x + dir.dx;
        const ny = player.y + dir.dy;

        // 防止越界（這裡以地圖的大小來處理）
        if (nx < 0 || nx >= currentMap[0].length || ny < 0 || ny >= currentMap.length) return;


        const cell = document.querySelector(`.cell[data-x="${nx}"][data-y="${ny}"]`);
        if (!cell) return;

        cell.classList.remove('dimmed'); // 顯示這格

        const value = currentMap[ny][nx];
        // 加上正確的 class
        if (value === 1) cell.classList.add('path');
        else if (value === 2) cell.classList.add('end');
        else if (value === 0) cell.classList.add('dead');

        // 移除遮罩
        const overlay = cell.querySelector('.overlay');
        if (overlay) overlay.style.display = 'none';
    });

    document.getElementById('lightCount').innerText = `提燈剩餘：${lightuse}`;
}

function getShortestPath(xStart, yStart, xGoal, yGoal, map) {
    const rows = map.length;
    const cols = map[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const cameFrom = Array.from({ length: rows }, () => Array(cols).fill(null));

    const queue = [{ x: xStart, y: yStart }];
    visited[yStart][xStart] = true;

    const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        if (x === xGoal && y === yGoal) {
            const path = [];
            let curr = { x, y };
            while (curr) {
                path.unshift(curr);
                curr = cameFrom[curr.y][curr.x];
            }
            return path;
        }

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (
                nx >= 0 && nx < cols &&
                ny >= 0 && ny < rows &&
                !visited[ny][nx] &&
                map[ny][nx] !== 0 &&
                map[ny][nx] !== 3
            ) {
                visited[ny][nx] = true;
                cameFrom[ny][nx] = { x, y };
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return null;
}

function isNearSafeZone(x, y) {
    const dirs = [
        { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    return dirs.some(d => {
        const nx = x + d.dx;
        const ny = y + d.dy;
        return (
            nx >= 0 && nx < currentMap[0].length &&
            ny >= 0 && ny < currentMap.length &&
            currentMap[ny][nx] === 3 // 安全屋 tile 值
        );
    });
}

//撞到怪物死亡
function checkCollision() {
    if (isGameOver) return;

    if (
        (monster.x === player.x && monster.y === player.y) ||
        (monster2.x === player.x && monster2.y === player.y) ||
        (monster3.x === player.x && monster3.y === player.y)
    ) {
        isGameOver = true;
        document.getElementById('countdown').innerText = "你被怪物吃掉了！";
        clearInterval(monster.interval);
        clearInterval(monster2.interval);
        clearInterval(monster3.interval);
        window.removeEventListener('keydown', handlePlayerMove);

        SoundManager.endGameAudio('lose');

        setTimeout(restartGame, 4000);
    }
}

function isReachableWithinSteps(startX, startY, endX, endY, maxSteps) {
    const queue = [{ x: startX, y: startY, steps: 0 }];
    const visited = Array(15).fill(0).map(() => Array(25).fill(false)); // 高15，寬25
    visited[startY][startX] = true;

    const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
    ];

    while (queue.length > 0) {
        const { x, y, steps } = queue.shift();

        if (x === endX && y === endY) {
            return true; // 找到路徑
        }

        if (steps >= maxSteps) continue; // 超過最大步數

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (
                nx >= 0 && nx < 25 &&
                ny >= 0 && ny < 15 &&
                !visited[ny][nx] &&
                currentMap[ny][nx] !== 0 // 不是牆
            ) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny, steps: steps + 1 });
            }
        }
    }
    return false; // 找不到路徑
}

let monster = {
    x: 19,
    y: 14,
    prevX: 0,
    prevY: 0,
    mode: "patrol",
    observeCooldown: 0
};

//畫怪物
function drawMonster() {
    const cell = document.querySelector(`.cell[data-x="${monster.x}"][data-y="${monster.y}"]`);
    if (cell) {
        const monsterImg = document.createElement('div');
        monsterImg.className = 'monster';
        monsterImg.style.backgroundImage = "url('./images/monster1.gif')";
        monsterImg.style.backgroundSize = 'cover';
        cell.appendChild(monsterImg);
    }
}

// 怪物移動邏輯
function moveMonster(reservedPositions) {
    if (monster.mode === "observe") {
        monster.observeCooldown--;
        if (monster.observeCooldown <= 0) {
            monster.mode = "patrol";
        }
        return;
    }

    const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];

    const path = getShortestPath(monster.x, monster.y, player.x, player.y, currentMap);

    let validMoves = directions
        .map(dir => ({
            x: monster.x + dir.dx,
            y: monster.y + dir.dy
        }))
        .filter(pos =>
            pos.x >= 0 && pos.x < 25 &&
            pos.y >= 0 && pos.y < 15 &&
            currentMap[pos.y][pos.x] !== 0 &&
            currentMap[pos.y][pos.x] !== 2 &&
            currentMap[pos.y][pos.x] !== 3 &&
            !reservedPositions.some(r => r.x === pos.x && r.y === pos.y)
        );

    if (path && path.length - 1 <= 3) {
        monster.mode = "chase";
        if (path.length >= 2) {
            const next = path[1];
            validMoves = [next];
        }
    } else {
        if (monster.mode === "chase") {
            monster.mode = "observe";
            monster.observeCooldown = 1;
            return;
        }

        monster.mode = "patrol";
        const nonDeadEnds = validMoves.filter(pos => {
            const exits = directions
                .map(d => ({ x: pos.x + d.dx, y: pos.y + d.dy }))
                .filter(p =>
                    p.x >= 0 && p.x < 25 &&
                    p.y >= 0 && p.y < 15 &&
                    currentMap[p.y][p.x] !== 0 &&
                    !(p.x === monster.x && p.y === monster.y)
                );
            const isBackStep = (pos.x === monster.prevX && pos.y === monster.prevY);
            return exits.length >= 1 && !isBackStep;
        });

        if (nonDeadEnds.length > 0) {
            validMoves = nonDeadEnds;
        }

        validMoves.sort(() => Math.random() - 0.5);
    }

    if (validMoves.length === 0) return;

    let safeMoves = validMoves.filter(move => !isNearSafeZone(move.x, move.y));
    if (safeMoves.length > 0) validMoves = safeMoves;

    const next = validMoves[0];
    reservedPositions.push({ x: next.x, y: next.y });

    const oldCell = document.querySelector(`.cell[data-x="${monster.x}"][data-y="${monster.y}"]`);
    if (oldCell) {
        const oldMonster = oldCell.querySelector('.monster');
        if (oldMonster) oldMonster.remove();
    }

    monster.prevX = monster.x;
    monster.prevY = monster.y;
    monster.x = next.x;
    monster.y = next.y;

    const newCell = document.querySelector(`.cell[data-x="${monster.x}"][data-y="${monster.y}"]`);
    if (newCell) {
        const newMonster = document.createElement('div');
        newMonster.className = 'monster';
        newMonster.style.backgroundImage = "url('./images/monster1.gif')";
        newMonster.style.backgroundSize = 'cover';
        newCell.appendChild(newMonster);
    }

    checkWarning();
    checkCollision();
}

//第二隻怪物設定
let monster2 = {
    x: 9,
    y: 0,
    prevX: 0,
    prevY: 0,
    mode: "patrol",
    observeCooldown: 0
};

function drawMonster2() {
    const cell = document.querySelector(`.cell[data-x="${monster2.x}"][data-y="${monster2.y}"]`);
    if (cell) {
        const monsterImg = document.createElement('div');
        monsterImg.className = 'monster2';
        monsterImg.style.backgroundImage = "url('./images/monster2.gif')";
        monsterImg.style.backgroundSize = 'cover';
        cell.appendChild(monsterImg);
    }
}

function moveMonster2(reservedPositions) {
    if (monster2.mode === "observe") {
        monster2.observeCooldown--;
        if (monster2.observeCooldown <= 0) {
            monster2.mode = "patrol";
        }
        return;
    }

    const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];

    const path = getShortestPath(monster2.x, monster2.y, player.x, player.y, currentMap);

    let validMoves = directions
        .map(dir => ({
            x: monster2.x + dir.dx,
            y: monster2.y + dir.dy,
        }))
        .filter(pos =>
            pos.x >= 0 && pos.x < 25 &&
            pos.y >= 0 && pos.y < 15 &&
            currentMap[pos.y][pos.x] !== 0 &&
            currentMap[pos.y][pos.x] !== 2 &&
            currentMap[pos.y][pos.x] !== 3 &&
            !reservedPositions.some(r => r.x === pos.x && r.y === pos.y)
        );

    if (path && path.length - 1 <= 5) {
        monster2.mode = "chase";
        if (path.length >= 2) {
            const next = path[1];
            validMoves = [next];
        }
    } else {
        if (monster2.mode === "chase") {
            monster2.mode = "observe";
            monster2.observeCooldown = 1;
            return;
        }

        monster2.mode = "patrol";
        const nonDeadEnds = validMoves.filter(pos => {
            const exits = directions
                .map(d => ({ x: pos.x + d.dx, y: pos.y + d.dy }))
                .filter(p =>
                    p.x >= 0 && p.x < 25 &&
                    p.y >= 0 && p.y < 15 &&
                    currentMap[p.y][p.x] !== 0 &&
                    !(p.x === monster2.x && p.y === monster2.y)
                );
            const isBackStep = (pos.x === monster2.prevX && pos.y === monster2.prevY);
            return exits.length >= 1 && !isBackStep;
        });

        if (nonDeadEnds.length > 0) {
            validMoves = nonDeadEnds;
        }

        validMoves.sort(() => Math.random() - 0.5);
    }

    if (validMoves.length === 0) return;

    let safeMoves = validMoves.filter(move => !isNearSafeZone(move.x, move.y));
    if (safeMoves.length > 0) validMoves = safeMoves;

    const next = validMoves[0];
    reservedPositions.push({ x: next.x, y: next.y });

    const oldCell = document.querySelector(`.cell[data-x="${monster2.x}"][data-y="${monster2.y}"]`);
    if (oldCell) {
        const oldMonster = oldCell.querySelector('.monster2');
        if (oldMonster) oldMonster.remove();
    }

    monster2.prevX = monster2.x;
    monster2.prevY = monster2.y;
    monster2.x = next.x;
    monster2.y = next.y;

    const newCell = document.querySelector(`.cell[data-x="${monster2.x}"][data-y="${monster2.y}"]`);
    if (newCell) {
        const newMonster = document.createElement('div');
        newMonster.className = 'monster2';
        newMonster.style.backgroundImage = "url('./images/monster2.gif')";
        newMonster.style.backgroundSize = 'cover';
        newCell.appendChild(newMonster);
    }

    checkWarning2();
    checkCollision();
}

//第三隻怪物設定
let monster3 = {
    x: 20,
    y: 1,
    prevX: 0,
    prevY: 0,
    mode: "patrol"
};

function isInMonster3Territory(x, y) {
    return x >= 19 && x <= 24 && y >= 0 && y <= 5;
}

function drawMonster3() {
    const cell = document.querySelector(`.cell[data-x="${monster3.x}"][data-y="${monster3.y}"]`);
    if (cell) {
        const m = document.createElement('div');
        m.className = 'monster3';
        m.style.backgroundImage = "url('./images/monster3.gif')";
        m.style.backgroundSize = 'cover';
        cell.appendChild(m);
    }
}

function moveMonster3(reservedPositions) {

    const playerInTerritory = isInMonster3Territory(player.x, player.y);

    const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];

    let validMoves = directions
        .map(d => ({
            x: monster3.x + d.dx,
            y: monster3.y + d.dy
        }))
        .filter(p =>
            p.x >= 0 && p.x < currentMap[0].length &&
            p.y >= 0 && p.y < currentMap.length &&
            isInMonster3Territory(p.x, p.y) &&
            currentMap[p.y][p.x] !== 0 &&
            currentMap[p.y][p.x] !== 2 &&
            currentMap[p.y][p.x] !== 3 &&
            !reservedPositions.some(r => r.x === p.x && r.y === p.y)
        );


    if (playerInTerritory) {
        monster3.mode = "chase";
        const path = getShortestPath(monster3.x, monster3.y, player.x, player.y, currentMap);
        if (path && path.length >= 2) {
            validMoves = [path[1]];
            checkWarning3();
        }
    } else {
        if (monster3.mode === "chase") {
            monster3.mode = "patrol";
        }
        checkWarning3();

        // 巡邏：排除回頭路，隨機選方向
        if (validMoves.length > 1) {
            validMoves = validMoves.filter(p => !(p.x === monster3.prevX && p.y === monster3.prevY));
        }
        validMoves.sort(() => Math.random() - 0.5);
    }

    if (validMoves.length === 0) return;
    const next = validMoves[0];
    reservedPositions.push({ x: next.x, y: next.y }); //  預約位置（防撞）

    // 清除舊位置
    const oldCell = document.querySelector(`.cell[data-x="${monster3.x}"][data-y="${monster3.y}"]`);
    if (oldCell) {
        const oldMonster = oldCell.querySelector('.monster3');
        if (oldMonster) oldMonster.remove();
    }

    monster3.prevX = monster3.x;
    monster3.prevY = monster3.y;
    monster3.x = next.x;
    monster3.y = next.y;

    drawMonster3();
    checkWarning3();
    checkCollision();

}

let tick = 0;

setInterval(() => {
    if (!isGameStarted || isPaused || isGameOver) return;

    const reservedPositions = [];

    if (tick % 7 === 0) moveMonster(reservedPositions);   // 怪物1：0.7 秒移動
    if (tick % 9 === 0) moveMonster2(reservedPositions); // 怪物2：0.8 秒移動
    if (tick % 5 === 0) moveMonster3(reservedPositions);  // 怪物3：0.5 秒移動

    tick++;
}, 100); // 每 100ms 為一個 tick


//  暫停所有怪物行動
function stopMonstersTemporarily() {
    isPaused = true;
}

//  恢復所有怪物行動
function resumeMonsters() {
    isPaused = false;
}

function checkWarning() {
    const reachable = isReachableWithinSteps(monster.x, monster.y, player.x, player.y, 3);
    const hint = document.getElementById('hint');
    hint.innerText = reachable ? "⚠️ 樹妖接近中！" : "";
}

function checkWarning2() {
    const reachable = isReachableWithinSteps(monster2.x, monster2.y, player.x, player.y, 3);
    const hint = document.getElementById('warning2');
    hint.innerText = reachable ? "⚠️ 鬼魂接近中！" : "";
}

function checkWarning3() {
    const reachable = isReachableWithinSteps(monster3.x, monster3.y, player.x, player.y, 3);
    const hint = document.getElementById('warning3');
    hint.innerText = reachable ? "⚠️ 食人魔接近中！" : "";

}



function showFullMap() {
    document.querySelectorAll('.cell').forEach(cell => {

        cell.classList.remove('dimmed');
    });
}

//開局倒數
let count = 10;
const countdown = setInterval(() => {
    if (count > 0) {
        document.getElementById('countdown').innerText = `天黑倒數：${count}`;
        count--;
    } else {
        clearInterval(countdown);
        document.getElementById('countdown').innerText = '遊戲開始！';
        hideMap();
        isGameStarted = true; // 倒數完，才開始接受按鍵
    }
}, 1000);


//天黑設定
function hideMap() {

    if (mapFullyRevealed) {
        showFullMap();
        return;
    }

    document.querySelectorAll('.cell').forEach((cell) => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const mapValue = currentMap[y][x];

        if (x === player.x && y === player.y) {
            // 玩家所在的格子不能遮
            cell.classList.remove('dimmed');
            return;
        }

        cell.classList.remove('dimmed'); // 先清空舊遮罩

        cell.classList.remove('dimmed', 'end', 'house'); // 清除所有狀態類別

        if (mapValue === 3) {
            // 安全屋
            cell.classList.add('dimmed', 'house');
        } else if (mapValue === 2) {
            // 終點
            cell.classList.add('dimmed', 'end');
        } else {
            // 黑幕遮罩
            cell.classList.add('dimmed');
        }


    });
}

//  新增：紀錄三間安全屋是否已觸發
const triggeredHouses = new Set();
let mapFullyRevealed = false;
let isPaused = false;

function updateHouseStatus() {
    const status = document.getElementById('house-status');
    status.innerText = `安全屋開啟：${triggeredHouses.size} / 3`;
}


function checkHouseTrigger() {
    const currentTile = currentMap[player.y][player.x];
    const key = `${player.x},${player.y}`;

    if (currentTile === 3 && !triggeredHouses.has(key)) {
        triggeredHouses.add(key);
        updateHouseStatus(); // 
        pauseGameFor3Seconds();

        // 如果三間都觸發了，永久亮圖
        if (triggeredHouses.size >= 3) {
            mapFullyRevealed = true;
        }
    }
}

function showLightCountdown(seconds) {
    const timerEl = document.getElementById('light-timer');
    timerEl.style.display = 'block';
    let remaining = seconds;
    timerEl.innerText = `全圖顯示中：${remaining}`;

    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            timerEl.style.display = 'none';
        } else {
            timerEl.innerText = `全圖顯示中：${remaining}`;
        }
    }, 1000);
}

function pauseGameFor3Seconds() {
    isPaused = true;

    showFullMap();
    showLightCountdown(3);

    // 暫停玩家與怪物行動
    window.removeEventListener('keydown', handlePlayerMove);
    stopMonstersTemporarily();

    setTimeout(() => {
        isPaused = false;
        if (!mapFullyRevealed) hideMap();
        window.addEventListener('keydown', handlePlayerMove);
        resumeMonsters();
    }, 3000);
}

//遊戲倒數
let count2 = 100;
const countdown2 = setInterval(() => {
    if (isPaused) return;

    if (count2 > 0) {
        count2--;
        document.getElementById('gametime').innerText = `剩餘時間：${count2}`;
    } else {
        clearInterval(countdown2);
        isGameOver = true;
        document.getElementById('countdown').innerText = "時間到了！";

        window.removeEventListener('keydown', handlePlayerMove);

        SoundManager.endGameAudio('lose');

        setTimeout(restartGame, 4000);
    }
}, 1000);


//重啟遊戲
function restartGame() {
    SoundManager.stopAll();
    SoundManager.play('click', { single: true, cooldown: 500 });


    // 等 300ms 再跳轉，讓點擊音效播放出來
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 300);
}

//遊戲贏了
let isGameOver = false;
function winGame() {
    isGameOver = true;

    // 玩家消失（移除 .player 類別）
    const playerCell = document.querySelector('.cell.player');
    if (playerCell) {
        playerCell.classList.remove('player');
    }

    document.getElementById('countdown').innerText = " 你贏了 !！";

    showFullMap();

    window.removeEventListener('keydown', handlePlayerMove);

    clearInterval(countdown2);

    SoundManager.stopAll();
    SoundManager.endGameAudio('win');

    // 分數計算
    setTimeout(() => {
        const timeScore = count2 * 50;
        const lanternScore = lightuse * 500;
        const diamondScore = diamondCount * 1500;
        const totalScore = timeScore + lanternScore + diamondScore;

        const resultBox = document.getElementById('gameResult');
        const detail = document.getElementById('resultDetail');

        detail.innerHTML = `
    剩餘時間：${count2} 秒（${timeScore} 分）<br>
    剩餘提燈：${lightuse} 個（${lanternScore} 分）<br>
    鑽石：${diamondCount} 顆（${diamondScore} 分）<br><br>
    <strong>總分：${totalScore} 分</strong>
  `;

        resultBox.classList.remove('hidden2');
    }, 300);
    // 稍微延遲，避免和畫面重疊
    SoundManager.stopAll();
    SoundManager.endGameAudio('win');
}

function closeResult() {
    document.getElementById('gameResult').classList.add('hidden2');
}
window.closeResult = closeResult;

document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-sound]');
    if (el) {
        const sound = el.dataset.sound;
        const action = el.dataset.action;

        const audio = new Audio(`.//select-sound-fixed.mp3`);
        audio.play();

        if (action && typeof window[action] === 'function') {
            setTimeout(() => {
                window[action]();
            }, 200); 
        }
    }
});

window.addEventListener('keydown', (e) => {
    const isF5 = e.key === 'F5';
    const isCtrlR = (e.key === 'r' || e.key === 'R') && e.ctrlKey;

    if (isF5 || isCtrlR) {
        e.preventDefault(); // 阻止刷新行為
        SoundManager.stopAll();        // 停止所有音樂
        SoundManager.play('click', { single: true, cooldown: 500 });



        setTimeout(() => {
            window.location.href = "../index.html";
        }, 300); // 延遲跳轉，讓音效播放完
    }
});

// 初始化流程
createGrid();
drawMonster();
drawMonster2();
drawMonster3();

SoundManager.stopAll(); // 保險措施
SoundManager.startGameAudio();


