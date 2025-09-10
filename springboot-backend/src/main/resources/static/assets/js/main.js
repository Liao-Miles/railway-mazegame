import SoundManager from "./soundManager.js";
import * as grid from "./grid.js";
import * as player from "./player.js"
import * as gameLogic from "./gameLogic.js"
import * as monster from "./monster.js"

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let startTime = parseInt(params.get('start'));

    // 判斷是否為重新整理（reload），若是則重設 start 參數
    const navEntry = performance.getEntriesByType('navigation')[0];
    const isReload = navEntry && navEntry.type === 'reload';


    if (isReload) {
        startTime = Date.now();
        params.set('start', startTime);
        window.location.replace(window.location.pathname + '?' + params.toString());
        return;
    }

    // 若沒有 start 參數，設為現在時間並 reload
    if (!startTime || isNaN(startTime)) {
        startTime = Date.now();
        params.set('start', startTime);
        window.location.replace(window.location.pathname + '?' + params.toString());
        return;
    }
    const elapsed = Date.now() - startTime;

    console.log(`音效排程開始，已延遲 ${elapsed}ms`);

    const tryPlay = () => {
        if (SoundManager.allLoaded) {
            SoundManager.startGameAudio(elapsed);
        } else {
            console.log('等待音效載入中...');
            setTimeout(tryPlay, 100);
        }
    };

    tryPlay();
});


SoundManager.load('click', 'assets/audio/select-sound-fixed-extended.mp3', 0.8);
SoundManager.load('start', 'assets/audio/game-start-6104.mp3', 1.0);
SoundManager.load('bgm', 'assets/audio/retro-game-music(gameMusic).mp3', 0.2);
SoundManager.load('hurry', 'assets/audio/game-zone-320262.mp3', 0.2);
SoundManager.load('win', 'assets/audio/game-over(win).mp3', 0.4);
SoundManager.load('lose', 'assets/audio/game-lose(death).mp3', 0.3);
SoundManager.autoBind(280);

// 初始化流程
gameLogic.isGameStarted;
gameLogic.isGameOver;
gameLogic.isPaused;

grid.createGrid();
grid.currentMap;

player.handlePlayerMove();
player.updatePlayerCell();

window.addEventListener('keydown', player.handlePlayerMove);

monster.drawMonster();
monster.drawMonster2();
monster.drawMonster3();
monster.startMonsterLoop();


window.addEventListener('DOMContentLoaded', () => {
  const playerName  = sessionStorage.getItem('playerName'); // 取得登入時存的名稱
  const displayElement = document.getElementById('playerIdDisplay');

  if (playerName  && displayElement) {
    displayElement.textContent = `玩家:${playerName}`;
  }
});
