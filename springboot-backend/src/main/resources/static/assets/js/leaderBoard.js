//(同源部屬可以不用，暫時註解)
// const API_BASE = 'http://localhost:8080';
import { authFetch } from './auth.js';

function saveToLeaderboard(score, timePlayed) {
  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName') || '未知玩家'; // 預設名稱

  if (playerId) {
    authFetch(`/leaderboard/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerId: playerId,
        playerName: playerName,
        score: score,
        timePlayed: timePlayed,
        timestamp: new Date().toISOString() // 紀錄時間
      })
    }).then(res => {
      if (res.ok) {
        console.log('排行榜資料已儲存');
      } else {
        console.error('儲存失敗');
      }
    }).catch(err => {
      console.error('送資料錯誤', err);
    });
  } else {
    console.error('玩家未登入，無法儲存排行榜資料');
  }
}

function loadLeaderboard() {
  const playerId = localStorage.getItem('playerId');
  if (!playerId) {
    console.warn('未登入，排行榜不顯示');
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (leaderboardBody) {
      leaderboardBody.innerHTML = `<tr><td colspan="5">請先登入以查看排行榜</td></tr>`;
    }
    return;
  }

  authFetch(`/leaderboard/top10`)
    .then(res => {
      if (!res.ok) throw new Error('後端回傳錯誤');
      return res.json();
    })
    .then(data => {
      const leaderboardBody = document.getElementById('leaderboard-body');
      if (!leaderboardBody) return;

      leaderboardBody.innerHTML = data.map((entry, index) => {
        const isCurrentPlayer = String(entry.playerId) === String(playerId);
        return `
          <tr ${isCurrentPlayer ? 'class="highlight-row"' : ''}>
      <td>${index + 1}</td>
      <td>${entry.playerName}</td>
      <td>${entry.score}</td>
      <td>${entry.timePlayed}</td>
      <td>${new Date(entry.timestamp).toLocaleString()}</td>
    </tr>

        `;
      }).join('');
    })
    .catch(err => {
      console.error('無法載入排行榜資料', err);
      const leaderboardBody = document.getElementById('leaderboard-body');
      if (leaderboardBody) {
        leaderboardBody.innerHTML = `<tr><td colspan="5">排行榜載入失敗</td></tr>`;
      }
    });
}

// 頁面載入後執行
window.addEventListener('DOMContentLoaded', loadLeaderboard);


export { saveToLeaderboard };