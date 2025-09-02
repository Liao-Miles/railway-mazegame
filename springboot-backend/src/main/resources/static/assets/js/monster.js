import { currentMap } from './grid.js'
import {isGameStarted, isGameOver, isPaused,setGameOver} from './gameLogic.js';
import {player,checkCollision} from './player.js' 
import {checkWarning,checkWarning2,checkWarning3} from "./gameLogic.js"


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
        monsterImg.style.backgroundImage = "url('assets/images/monster1.gif')";
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
        newMonster.style.backgroundImage = "url('assets/images/monster1.gif')";
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
        monsterImg.style.backgroundImage = "url('assets/images/monster2.gif')";
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
        newMonster.style.backgroundImage = "url('assets/images/monster2.gif')";
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
        m.style.backgroundImage = "url('assets/images/monster3.gif')";
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

function startMonsterLoop() {
  setInterval(() => {
    if (!isGameStarted || isPaused || isGameOver) return;

    const reservedPositions = [];

    if (tick % 7 === 0) moveMonster(reservedPositions);   // 怪物1：0.7 秒移動
    if (tick % 9 === 0) moveMonster2(reservedPositions);  // 怪物2：0.8 秒移動
    if (tick % 5 === 0) moveMonster3(reservedPositions);  // 怪物3：0.5 秒移動

    tick++;
  }, 100);
}

export {
    getShortestPath,
    isNearSafeZone,
    isReachableWithinSteps,
    isInMonster3Territory,
    startMonsterLoop,
    monster,
    drawMonster,
    monster2,
    drawMonster2,
    monster3,
    drawMonster3,
}