const SoundManager = {
  sounds: {},
  loadedFlags: {},
  allLoaded: false,
  _timers: [],
  _lastPlayTime: {},

  autoBind: function (delay = 200) {
    document.querySelectorAll('[data-jump]').forEach(button => {
      button.addEventListener('click', () => {
        let url = button.getAttribute('data-jump');
        const sound = button.getAttribute('data-sound');
        if (sound) this.play(sound, { single: true });
        // 統一跳轉為絕對路徑，確保所有頁面都能正確跳轉
        if (!url.startsWith('/')) url = '/' + url;
        this._timers.push(setTimeout(() => {
          window.location.href = url;
        }, delay));
      });
    });
  },

  load: function (name, src, volume = 1) {
    // 確保 src 僅為檔名，避免重複路徑
    if (src.startsWith('assets/audio/')) {
      src = src.replace('assets/audio/', '');
    } else if (src.startsWith('/assets/audio/')) {
      src = src.replace('/assets/audio/', '');
    }
    const audio = new Audio();
    audio.src = `/assets/audio/${src}`;
    audio.volume = volume;
    audio.preload = 'auto';
    audio.load();

    this.loadedFlags[name] = false;

    audio.addEventListener('canplaythrough', () => {
      this.loadedFlags[name] = true;
      console.log(` 音效 ${name} 載入完成`);
      this.allLoaded = Object.values(this.loadedFlags).every(Boolean);
      if (this.allLoaded) {
        console.log('所有音效已載入完成');
      }
    });

    this.sounds[name] = audio;
  },

  play: function (name, options = {}) {
    const audio = this.sounds[name];
    if (!audio || !this.loadedFlags[name]) {
      console.warn(`音效 ${name} 尚未載入完成或不存在`);
      return;
    }

    if (options.single) {
      const now = Date.now();
      const last = this._lastPlayTime[name] || 0;
      const cooldown = options.cooldown || 300; // 預設 300ms 內不重播
      if (now - last < cooldown) {
        console.log(`音效 ${name} 單次播放冷卻中，跳過`);
        return;
      }
      this._lastPlayTime[name] = now;
    }

    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn(`播放失敗:`, err);
    });
  },

  stop: function (name) {
    const audio = this.sounds[name];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  },

  stopAll: function () {
    for (const sound of Object.values(this.sounds)) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (err) {
        console.warn(`  無法停止音效`, err);
      }
    }
    this._timers.forEach(clearTimeout);
    this._timers = [];
  },

  startGameAudio: function (elapsed = 0) {

     // 先停止所有音樂與計時器，避免殘留
    this.stopAll();

    const start = this.sounds['start'];
    const bgm = this.sounds['bgm'];
    const hurry = this.sounds['hurry'];

    const startDuration = 2000;
    const bgmDuration = 65500;
    const gap = 500;
    const hurryStart = startDuration + bgmDuration + gap;

    if (!this.loadedFlags['start'] || !this.loadedFlags['bgm'] || !this.loadedFlags['hurry']) {
      console.warn(' 音效尚未載入完成，跳過播放');
      return;
    }

    // 確保每首歌都歸零
    start.pause(); start.currentTime = 0;
    bgm.pause(); bgm.currentTime = 0;
    hurry.pause(); hurry.currentTime = 0;

    if (elapsed < startDuration) {
      start.currentTime = elapsed / 1000;
      start.play();
    }

    const bgmStart = startDuration - elapsed;
    if (bgmStart <= 0) {
      bgm.currentTime = -bgmStart / 1000;
      bgm.play();
      this._timers.push(setTimeout(() => bgm.pause(), bgmDuration + bgmStart));
    } else {
      this._timers.push(setTimeout(() => {
        bgm.currentTime = 0;
        bgm.play();
        this._timers.push(setTimeout(() => bgm.pause(), bgmDuration));
      }, bgmStart));
    }

    const hurryOffset = elapsed - hurryStart;
    if (hurryOffset >= 0) {
      hurry.currentTime = hurryOffset / 1000;
      hurry.play();
    } else {
      this._timers.push(setTimeout(() => {
        hurry.currentTime = 0;
        hurry.play();
      }, hurryStart - elapsed));
    }

    this.autoBind(280);
  },

  endGameAudio: function (result) {
    this.stopAll();
    this.play(result === 'win' ? 'win' : 'lose');
  }
};

SoundManager.load('click', 'select-sound-fixed-extended.mp3', 1); // 載入點擊音效

export default SoundManager;
