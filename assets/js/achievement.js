// 先定義統一的 API Base URL
const API_BASE = 'https://mazegame-production-ffe3.up.railway.app';

document.addEventListener('DOMContentLoaded', async () => {
    const playerId = sessionStorage.getItem('playerId');
    if (!playerId) {
        document.getElementById('playerName').textContent = '玩家：未登入';
        document.getElementById('playerAccount').textContent = '帳號：未登入';
        return;
    }

    try {
        // fetch 改用 API_BASE
        const res = await fetch(`${API_BASE}/api/achievements/player/${playerId}/achievements`);
        const data = await res.json();

        document.getElementById('playerName').textContent = `玩家名稱：${data.playerName}`;
        document.getElementById('playerAccount').textContent = `帳號：${data.account}`;

        const achievementList = document.getElementById('achievementList');
        achievementList.innerHTML = '';

        data.achievements.forEach(a => {
            const card = document.createElement('div');
            card.classList.add('achievement-card');
            card.classList.add(a.unlocked ? 'unlocked' : 'locked');

            // 只有「全靠自己」未解鎖才顯示 ???
            if (a.name === '全靠自己' && !a.unlocked) {
                card.innerHTML = `
                    <h3>???</h3>
                    <p>??????????????????</p>
                    <p></p>
                `;
            } else {
                card.innerHTML = `
                    <h3>${a.name}</h3>
                    <p>${a.description}</p>
                    <p>${a.unlockedAt ? a.unlockedAt.replace('T', ' ') : ''}</p>
                `;
            }

            achievementList.appendChild(card);
        });

    } catch (e) {
        document.getElementById('playerName').textContent = '玩家：取得失敗';
        document.getElementById('playerAccount').textContent = '帳號：取得失敗';
    }
});
