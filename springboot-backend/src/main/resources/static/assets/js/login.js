import SoundManager from './soundManager.js'; // 確保引入 SoundManager
import { setAccessToken, logout as authLogout } from './auth.js';

//(同源部屬可以不用，暫時註解)
// const API_BASE = 'http://localhost:8080';

// 切換彈出式框顯示/隱藏
    window.toggleModal = function (show) {
      const modal = document.getElementById('authModal');
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      if (modal) {
        SoundManager.play('click'); // 播放點擊音效
        modal.classList.toggle('hidden', !show);
        if (show && loginForm && registerForm) {
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden'); // 預設回到登入表單
        }
      }
    };

    // 切換登入/註冊表單
    window.switchForm = function (form) {
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      if (loginForm && registerForm) {
        if (form === 'login') {
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
        } else {
          loginForm.classList.add('hidden');
          registerForm.classList.remove('hidden');
        }
      }
    };

    

   // 處理登入
window.handleLogin = async function (event) {
  event.preventDefault();
  const account = document.querySelector('#loginForm input[placeholder="帳號"]').value;
  const password = document.querySelector('#loginForm input[placeholder="密碼"]').value;

  if (!account || !password) {
    alert('請輸入帳號和密碼！');
    return;
  }

  try {
    const response = await fetch(`/player/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
    });

    if (response.status === 200) {
    const result = await response.json(); // 接收 JSON 結構
    const playerId = result.playerId;
    const playerName = result.name;
    const accessToken = result.accessToken;

    // 儲存 playerId 與 playerName
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', playerName);
    setAccessToken(accessToken); // 存 access token

    toggleModal(false);
    showPlayerInfo(playerName);
    alert('登入成功！');
    } else if (response.status === 401) {
      alert('帳號或密碼錯誤');
    } else {
      alert('登入失敗：' + response.status);
    }
  } catch (error) {
    console.error('登入錯誤：', error);
    alert('連接伺服器失敗');
  }
};


// 處理註冊
window.handleRegister = async function (event) {
  event.preventDefault();
  const name = document.querySelector('#registerForm input[placeholder="請輸入您的名稱"]').value;
  const account = document.querySelector('#registerForm input[placeholder="帳號"]').value;
  const password = document.querySelector('#registerForm input[placeholder="密碼"]').value;

  if (!name || !account || !password) {
    alert('請填寫所有欄位！');
    return;
  }

  try {
    const response = await fetch(`/player/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, account, password }),
    });

    if (response.ok) {
      // 註冊成功後自動登入
      const loginResponse = await fetch(`/player/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, password }),
      });
      if (loginResponse.status === 200) {
        const result = await loginResponse.json();
        const playerId = result.playerId;
        const playerName = result.name;
        localStorage.setItem('playerId', playerId);
        localStorage.setItem('playerName', playerName);
        setAccessToken(result.accessToken); // 自動存 access token
        toggleModal(false);
        showPlayerInfo(playerName);
        alert('註冊並自動登入成功！');
      } else {
        alert('註冊成功但自動登入失敗，請手動登入');
      }
    } else if (response.status === 409) {
      alert('帳號已被註冊');
    } else {
      alert('註冊失敗：' + response.status);
    }
  } catch (error) {
    console.error('註冊錯誤：', error);
    alert('連接伺服器失敗');
  }
};


// 顯示玩家 ID 並隱藏登入按鈕
window.showPlayerInfo = function (playerName) {
  const playerIdDisplay = document.getElementById('playerIdDisplay');
  const playerInfo = document.getElementById('playerInfo');
  const loginBtn = document.querySelector('button[onclick="toggleModal(true)"]'); // 找到登入按鈕

  if (playerIdDisplay && playerInfo) {
    playerIdDisplay.textContent = `歡迎! ${playerName}`;
    playerIdDisplay.classList.remove('hidden');
    playerInfo.classList.remove('hidden'); // 顯示登出按鈕
  }

  if (loginBtn) {
    loginBtn.classList.add('hidden'); // 隱藏登入按鈕
  }
};

// 登出
window.logout = function () {
  authLogout();
  location.reload();
};


    // 檢查登入狀態
    window.onload = function () {
    let playerId = localStorage.getItem('playerId');
    let playerName = localStorage.getItem('playerName');
    if (playerId && playerName) {
        showPlayerInfo(playerName);
    } else {
        const playerInfo = document.getElementById('playerInfo');
        const playerIdDisplay = document.getElementById('playerIdDisplay');
        if (playerInfo) {
            playerInfo.classList.add('hidden'); // 確保未登入時登出按鈕隱藏
        }
        if (playerIdDisplay) {
            playerIdDisplay.textContent = ''; // 確保未登入時不顯示玩家名稱
        }
    }
};
