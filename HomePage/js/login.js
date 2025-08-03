import SoundManager from '../../Game/js/soundManager.js'; // 確保引入 SoundManager

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
    const response = await fetch('http://localhost:8080/player/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
    });

    if (response.status === 200) {
      const playerName = await response.text();
      if (!playerName || playerName.trim() === '') {
        alert('登入失敗：帳號或密碼錯誤');
        return;
      }
      sessionStorage.setItem('playerId', playerName);
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
    const response = await fetch('http://localhost:8080/player/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, account, password }),
    });

    if (response.ok) {
      alert('註冊成功！');
      toggleModal(false);
      showPlayerInfo(name); 
    } else if (response.status === 409) {
      alert('帳號或名稱已被註冊');
    } else {
      alert('註冊失敗：' + response.status);
    }
  } catch (error) {
    console.error('註冊錯誤：', error);
    alert('連接伺服器失敗');
  }
};


    // 顯示玩家 ID
window.showPlayerInfo = function (playerName) {
  const playerIdDisplay = document.getElementById('playerIdDisplay');
  const playerInfo = document.getElementById('playerInfo');
  if (playerIdDisplay && playerInfo) {
    playerIdDisplay.textContent = `歡迎! ${playerName}`;
    playerIdDisplay.classList.remove('hidden');
    playerInfo.classList.remove('hidden'); // 顯示登出按鈕
  }
};

    // 登出功能
    window.logout = function () {
      SoundManager.play('click'); // 播放點擊音效
      sessionStorage.removeItem('playerId'); // 清除登入狀態
      const playerIdDisplay = document.getElementById('playerIdDisplay');
      const playerInfo = document.getElementById('playerInfo');
      if (playerIdDisplay && playerInfo) {
        playerIdDisplay.classList.add('hidden');
        playerIdDisplay.textContent = '';
        playerInfo.classList.add('hidden'); // 隱藏登出按鈕
      }
      alert('已登出');
    };

    // 檢查登入狀態
    window.onload = function () {
      const playerId = sessionStorage.getItem('playerId');
      if (playerId) {
        showPlayerInfo(playerId);
      } else {
        const playerInfo = document.getElementById('playerInfo');
        if (playerInfo) {
          playerInfo.classList.add('hidden'); // 確保未登入時登出按鈕隱藏
        }
      }
    };