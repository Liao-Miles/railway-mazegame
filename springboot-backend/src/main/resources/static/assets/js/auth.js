// auth.js
// 管理 access token 與自動刷新

let accessToken = null;

function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem('accessToken', token);
  else sessionStorage.removeItem('accessToken');
}

function getAccessToken() {
  if (!accessToken) {
    accessToken = sessionStorage.getItem('accessToken');
  }
  return accessToken;
}

function clearAccessToken() {
  accessToken = null;
  sessionStorage.removeItem('accessToken');
}

// 包裝 fetch，遇到 401 自動刷新 access token 並重試
async function authFetch(url, options = {}, retry = true) {
  if (!options.headers) options.headers = {};
  const token = getAccessToken();
  if (token) {
    options.headers['Authorization'] = 'Bearer ' + token;
  }
  let res = await fetch(url, options);
  if (res.status === 401 && retry) {
    // 嘗試刷新 access token
    const refreshRes = await fetch('/player/refresh-token', { method: 'POST', credentials: 'include' });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      // 重試原請求
      options.headers['Authorization'] = 'Bearer ' + data.accessToken;
      res = await fetch(url, options);
    } else {
      clearAccessToken();
      // 可選：自動登出
    }
  }
  return res;
}

function logout() {
  clearAccessToken();
  // 可選：呼叫後端清除 refresh token cookie
  fetch('/player/logout', { method: 'POST', credentials: 'include' });
  localStorage.removeItem('playerId');
  localStorage.removeItem('playerName');
}

export { setAccessToken, getAccessToken, clearAccessToken, authFetch, logout };
