import {currentMap, maps } from "./grid.js"
import {player, handlePlayerMove, lightuse,diamondCount} from './player.js'
import {isReachableWithinSteps,monster,monster2,monster3} from "./monster.js"
import SoundManager from "./soundManager.js";

//(同源部屬可以不用，暫時註解)
// const API_BASE = 'http://localhost:8080';

let hasFailed = false;

// 新增失誤追蹤函數
function markAsFailed() {
    hasFailed = true;
}

// 設定遊戲結束狀態
function setGameOver(value) {
    isGameOver = value;
}
let isGameStarted = false;

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

// 開局倒數
let count = 10;
const countdown = setInterval(() => {
    const countdownElem = document.getElementById('countdown');
    if (count > 0) {
        if (countdownElem) {
            countdownElem.innerText = `天黑倒數：${count}`;
        }
        count--;
    } else {
        clearInterval(countdown);
        if (countdownElem) {
            countdownElem.innerText = '遊戲開始！';
        }
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

// 遊戲倒數
let count2 = 100;
const countdown2 = setInterval(() => {
    if (isPaused) return;

    const gametimeElem = document.getElementById('gametime');
    const countdownElem = document.getElementById('countdown');

    if (count2 > 0) {
        count2--;
        if (gametimeElem) {
            gametimeElem.innerText = `剩餘時間：${count2}`;
        }
    } else {
        clearInterval(countdown2);
        isGameOver = true;
        if (countdownElem) {
            countdownElem.innerText = "時間到了！";
        }

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

    // 玩家消失
    const playerCell = document.querySelector('.cell.player');
    if (playerCell) playerCell.classList.remove('player');

    document.getElementById('countdown').innerText = "你贏了 !！";

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

        const playerId = localStorage.getItem('playerId');

        if (playerId) import('./leaderBoard.js').then(({ saveToLeaderboard }) => saveToLeaderboard(totalScore, count2));

        // --- 成就解鎖 ---
        if (playerId) {
            const achievements = [];

            // 平安離開
            achievements.push('平安離開');

            // 尋寶者
            if (diamondCount >= 4) achievements.push('尋寶者');

            // 完美主義
            if (!hasFailed) achievements.push('完美主義');

            // 快還要更快
            if (count2 > 70) achievements.push('快還要更快');

            // 活著真好（通關所有地圖）
            const currentMapId = Number(localStorage.getItem('currentMapId'));
            let clearedMaps = JSON.parse(localStorage.getItem(`player_${playerId}_maps`) || '[]');
            clearedMaps = clearedMaps.map(id => Number(id));

            const mapCount = Number(localStorage.getItem('mapCount'));

            if (!clearedMaps.includes(currentMapId)) {
                clearedMaps.push(currentMapId);
                localStorage.setItem(`player_${playerId}_maps`, JSON.stringify(clearedMaps));
            }

            if (clearedMaps.length >= mapCount) achievements.push('活著真好');

            // 新增「全靠自己」隱藏成就：未進安全屋、未使用提燈
            if (triggeredHouses.size === 0 && lightuse === 10) achievements.push('全靠自己');

            // 解鎖成就
            const token = localStorage.getItem('jwtToken');
            achievements.forEach(name => {
                fetch(`/api/achievements/unlock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
                    },
                    body: JSON.stringify({ playerId, achievementName: name })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            console.log(`${name} 成就解鎖成功！`);
                            showAchievementToast(name); //  使用佇列版
                        } else {
                            console.error(`${name} 成就解鎖失敗`, data);
                        }
                    })
                    .catch(err => console.error(`解鎖 ${name} 成就出錯:`, err));
            });


            // 顯示成就列表
            displayAchievements(playerId);
        }

    }, 300);
}

const achievementQueue = [];
let isShowingToast = false;

function showAchievementToast(name) {
    achievementQueue.push(name);
    if (!isShowingToast) {
        processNextToast();
    }
}

function processNextToast() {
    if (achievementQueue.length === 0) {
        isShowingToast = false;
        return;
    }

    isShowingToast = true;
    const name = achievementQueue.shift();

    const container = document.getElementById('achievement-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.innerText = ` 成就解鎖：${name}`;
    toast.style.background = 'rgba(0,0,0,0.8)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 15px';
    toast.style.marginTop = '10px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = 'bold';
    toast.style.border = '2px solid #FFD700'; // 金色邊框
    toast.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '1';
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(toast);
            processNextToast(); // 顯示下一個
        }, 500);
    }, 2000); // 每個顯示 2 秒
}


function closeResult() {
  document.getElementById('gameResult').classList.add('hidden2');
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('[data-action="closeResult"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeResult);
  }
});


export {
    isGameStarted,
    stopMonstersTemporarily,
    resumeMonsters,
    checkWarning,
    checkWarning2,
    checkWarning3,
    count,
    hideMap,
    mapFullyRevealed,
    isPaused,
    updateHouseStatus,
    checkHouseTrigger,
    showLightCountdown,
    pauseGameFor3Seconds,
    count2,
    isGameOver,
    setGameOver, 
    winGame,
    closeResult,
    restartGame,
    markAsFailed

}