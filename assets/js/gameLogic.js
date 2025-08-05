import{currentMap } from "./grid.js"
import {player, handlePlayerMove, lightuse,diamondCount} from './player.js' 
import {isReachableWithinSteps,monster,monster2,monster3} from "./monster.js"
import SoundManager from "./soundManager.js";


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

        // 修正：檢查玩家是否登入，未登入則不呼叫 saveToLeaderboard()
        const playerId = sessionStorage.getItem('playerId');
        if (playerId) {
            import('./leaderBoard.js').then(({ saveToLeaderboard }) => {
                saveToLeaderboard(totalScore, count2);
            });
        } else {
            console.warn('玩家未登入，排行榜資料未儲存');
        }

    }, 300);
    // 稍微延遲，避免和畫面重疊
    SoundManager.stopAll();
    SoundManager.endGameAudio('win');

    
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
  
}