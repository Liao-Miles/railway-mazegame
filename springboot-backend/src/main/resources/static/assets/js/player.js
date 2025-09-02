import {isGameStarted, isGameOver, isPaused,
        checkWarning,checkWarning2,checkWarning3,
        checkHouseTrigger, setGameOver, restartGame,winGame, markAsFailed} from './gameLogic.js' ;
import { currentMap } from './grid.js';
import {monster,monster2,monster3} from "./monster.js"
import SoundManager from './soundManager.js'; // 引入 SoundManager



let player = {
    x: 0,
    y: 14,
};

const respawnPoint = {
    x: 0,
    y: 14
};

let lightuse = 10;

let diamondCount = 0; // 吃了幾顆

const seenTiles = Array(15).fill(0).map(() => Array(25).fill(false)); // 地圖高15寬25   

let lastMoveTime = 0;
const moveCooldown = 100;

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
    if (currentMap[newY][newX] === 0) {
        markAsFailed();
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

// 撞到怪物死亡
function checkCollision() {
    if (isGameOver) return;

    if (
        (monster.x === player.x && monster.y === player.y) ||
        (monster2.x === player.x && monster2.y === player.y) ||
        (monster3.x === player.x && monster3.y === player.y)
    ) {
        setGameOver(true);
        document.getElementById('countdown').innerText = "你被怪物吃掉了！";
        clearInterval(monster.interval);
        clearInterval(monster2.interval);
        clearInterval(monster3.interval);
        window.removeEventListener('keydown', handlePlayerMove);

        SoundManager.endGameAudio('lose'); // 確保 SoundManager 已正確引入

        setTimeout(restartGame, 4000);
    }
}

export {
    player,
    lightuse,
    diamondCount,
    lastMoveTime,
    handlePlayerMove,
    checkCollision,
    updatePlayerCell
}