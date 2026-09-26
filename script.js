const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwWCZXoUxNFYJquX1SMtzaPpLTkPCzv8t2s1CDW9sLakcyOYdVIwqLRwjRXXNd9wg7tAw/exec';

const IS_RANKING_PUBLIC = true;
const IS_SUBMISSION_OPEN = true;

const settingsDatabase = {
  "IIDX": {
    songs: [
      "BENiZAKURA",
      "九十九ノ恋結ビ",
      "月下散刄"
    ],
    difficulties: [
      "BEGINNER",
      "NORMAL",
      "HYPER",
      "ANOTHER",
      "LEGGENDARIA"
    ],
  },
  "SDVX": {
    songs: [
      "It's All Right",
      "いますぐ輪廻",
      "モノノケ狂想曲"
    ],
    difficulties: [
      "NOV",
      "ADV",
      "EXH",
      "MXM"
    ],
    description: "提出する値：通常スコア"
  },
  "CHUNITHM": {
    songs: [
      "inkar-usi",
      "ERIS -Legend of Gaidelia-",
      "Nijirate Fanatics"
    ],
    difficulties: [
      "BASIC",
      "ADVANCED",
      "EXPERT",
      "MASTER"
    ],
    description: "提出する値：通常スコア"
  },
  "オンゲキ": {
    songs: [
      "Λlteration",
      "ラグトレイン",
      "セガサターン起動音[H.][Remix]"
    ],
    difficulties: [
      "BASIC",
      "ADVANCED",
      "EXPERT",
      "MASTER",
      "LUNATIC"
    ],
    description: "提出する値：テクニカルスコア"
  },
  "maimai でらっくす": {
    songs: [
      "悪戯 (ST)",
      "STEREOSCAPE (DX)",
      "HANIPAGANDA (DX)"
    ],
    difficulties: [
      "BASIC",
      "ADVANCED",
      "EXPERT",
      "MASTER",
      "Re:MASTER"
    ],
    description: "提出する値：通常スコア[%]×10000"
  },
  "太鼓の達人": {
    songs: [
      "Fly away",
      "星屑とリニアと僕",
      "カグツチ"
    ],
    difficulties: [
      "かんたん",
      "ふつう",
      "むずかしい",
      "おに"
    ],
    description: "提出する値：スコア"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const gameSelect = document.getElementById('gameSelect');
  const songSelect = document.getElementById('songSelect');
  const difficultySelect = document.getElementById('difficultySelect');
  const form = document.getElementById('scoreForm');
  const statusMessage = document.getElementById('statusMessage');
  const submitButton = document.getElementById('submitButton');
  const rankingContainer = document.getElementById('rankingContainer');
  const gameDescription = document.getElementById('gameDescription');
  
  const tidInput = document.getElementById('tidInput');
  const nameInput = document.getElementById('nameInput');

  // 【追加】ページ読み込み時に保存された値をセット
  if (localStorage.getItem('savedTid')) tidInput.value = localStorage.getItem('savedTid');
  if (localStorage.getItem('savedName')) nameInput.value = localStorage.getItem('savedName');

  function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = isError ? 'error' : 'success';
  }

  gameSelect.addEventListener('change', () => {
    const selectedGame = gameSelect.value;
    
    songSelect.innerHTML = ''; 
    difficultySelect.innerHTML = '';

    if (selectedGame && settingsDatabase[selectedGame]) {
      const settings = settingsDatabase[selectedGame];

      if (settings.description) {
        gameDescription.textContent = settings.description;
        gameDescription.style.display = 'block';
      } else {
        gameDescription.style.display = 'none';
      }
      
      songSelect.disabled = false;
      const placeholderSong = document.createElement('option');
      placeholderSong.value = "";
      placeholderSong.textContent = "-- 曲名を選んでください --";
      songSelect.appendChild(placeholderSong);
      
      settings.songs.forEach(songName => {
        const option = document.createElement('option');
        option.value = songName;
        option.textContent = songName;
        songSelect.appendChild(option);
      });
      
      difficultySelect.disabled = false;
      const placeholderDiff = document.createElement('option');
      placeholderDiff.value = "";
      placeholderDiff.textContent = "-- 難易度を選んでください --";
      difficultySelect.appendChild(placeholderDiff);

      settings.difficulties.forEach(diffName => {
        const option = document.createElement('option');
        option.value = diffName;
        option.textContent = diffName;
        difficultySelect.appendChild(option);
      });

    } else {
      songSelect.disabled = true;
      const placeholderSong = document.createElement('option');
      placeholderSong.value = "";
      placeholderSong.textContent = "-- まず機種を選んでください --";
      songSelect.appendChild(placeholderSong);

      difficultySelect.disabled = true;
      const placeholderDiff = document.createElement('option');
      placeholderDiff.value = "";
      placeholderDiff.textContent = "-- まず機種を選んでください --";
      difficultySelect.appendChild(placeholderDiff);
      gameDescription.style.display = 'none';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    if (!IS_SUBMISSION_OPEN) {
      setStatus("スコア送信期間は終了しました！結果発表をお待ちください。", true);
      return;
    }

    const tidValue = tidInput.value.trim();
    const nameValue = nameInput.value.trim();

    if (!tidValue || !nameValue) {
      setStatus("X IDと名前は両方必須です（空白のみは不可）。", true);
      return;
    }

    // 【追加】送信時にlocalStorageに保存
    localStorage.setItem('savedTid', tidValue);
    localStorage.setItem('savedName', nameValue);

    submitButton.disabled = true;
    submitButton.textContent = '送信中...';
    setStatus('');
    
    const formData = {
      game: document.getElementById('gameSelect').value,
      song: document.getElementById('songSelect').value,
      difficulty: document.getElementById('difficultySelect').value,
      tid: tidValue,
      name: nameValue,
      score: document.getElementById('scoreInput').value,
      comment: document.getElementById('commentInput').value
    };

    fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      mode: 'no-cors'
    })
    .then(response => {
      setStatus('スコアを送信しました！最新のランキングを読み込みます...', false);
      form.reset(); 
      
      // 【修正】フォームリセット後、保存されたIDと名前を再セット
      tidInput.value = localStorage.getItem('savedTid') || '';
      nameInput.value = localStorage.getItem('savedName') || '';

      songSelect.innerHTML = '<option value="">-- まず機種を選んでください --</option>';
      songSelect.disabled = true;
      difficultySelect.innerHTML = '<option value="">-- まず機種を選んでください --</option>';
      difficultySelect.disabled = true;
      
      loadRankings(); 
    })
    .catch(error => {
      setStatus(`ネットワークエラー: ${error.message}`, true);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = '送信';
    });
  });

  function displayRankings(data) {
    rankingContainer.innerHTML = '';
    
    if (data.length === 0) {
      rankingContainer.innerHTML = '<p>まだスコアデータがありません。</p>';
      return;
    }

    const groupedByGame = data.reduce((acc, record) => {
      if (!record.game) return acc;
      const game = record.game;
      if (!acc[game]) {
        acc[game] = [];
      }
      acc[game].push(record);
      return acc;
    }, {});

    const gameOrder = Object.keys(settingsDatabase);
    const sortedGames = Object.keys(groupedByGame).sort((a, b) => {
      const indexA = gameOrder.indexOf(a) === -1 ? 999 : gameOrder.indexOf(a);
      const indexB = gameOrder.indexOf(b) === -1 ? 999 : gameOrder.indexOf(b);
      return indexA - indexB;
    });

    for (const gameName of sortedGames) {
      const gameSection = document.createElement('div');
      gameSection.className = 'game-ranking';
      
      const gameTitle = document.createElement('h3');
      gameTitle.textContent = gameName;
      gameSection.appendChild(gameTitle);

      const groupedBySong = groupedByGame[gameName].reduce((acc, record) => {
        if (!record.song) return acc;
        const song = record.song;
        if (!acc[song]) {
          acc[song] = [];
        }
        acc[song].push(record);
        return acc;
      }, {});

      const songOrder = settingsDatabase[gameName] ? settingsDatabase[gameName].songs : [];
      const sortedSongs = Object.keys(groupedBySong).sort((a, b) => {
        const indexA = songOrder.indexOf(a) === -1 ? 999 : songOrder.indexOf(a);
        const indexB = songOrder.indexOf(b) === -1 ? 999 : songOrder.indexOf(b);
        return indexA - indexB;
      });

      for (const songName of sortedSongs) {
        const songSection = document.createElement('div');
        songSection.className = 'song-ranking';
        
        const songTitle = document.createElement('h4');
        songTitle.textContent = songName;
        songSection.appendChild(songTitle);

        const groupedByDifficulty = groupedBySong[songName].reduce((acc, record) => {
          if (!record.difficulty) return acc;
          const difficulty = record.difficulty;
          if (!acc[difficulty]) {
            acc[difficulty] = [];
          }
          acc[difficulty].push(record);
          return acc;
        }, {});

        const diffOrder = settingsDatabase[gameName] ? settingsDatabase[gameName].difficulties : [];
        const sortedDifficulties = Object.keys(groupedByDifficulty).sort((a, b) => {
          const indexA = diffOrder.indexOf(a) === -1 ? 999 : diffOrder.indexOf(a);
          const indexB = diffOrder.indexOf(b) === -1 ? 999 : diffOrder.indexOf(b);
          return indexA - indexB;
        });

        for (const difficultyName of sortedDifficulties) {
          const difficultySection = document.createElement('div');
          difficultySection.className = 'difficulty-ranking';
          
          const difficultyTitle = document.createElement('h5');
          difficultyTitle.textContent = difficultyName;
          difficultySection.appendChild(difficultyTitle);
          
          const highestScores = new Map();
          
          for (const record of groupedByDifficulty[difficultyName]) {
            if (!record.tid || !record.name || record.score === null || record.score === undefined) continue;
            const tid = record.tid;
            if (!highestScores.has(tid) || record.score > highestScores.get(tid).score) {
              highestScores.set(tid, record);
            }
          }
          
          const filteredRecords = Array.from(highestScores.values());
          
          const sortedRecords = filteredRecords.sort((a, b) => b.score - a.score);

          const list = document.createElement('ol');
          sortedRecords.forEach((record, index) => {
            const item = document.createElement('li');
            
            const rankSpan = document.createElement('span');
            rankSpan.className = 'rank';
            rankSpan.textContent = (index + 1) + '.';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            nameSpan.textContent = record.name;

            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'score';
            scoreSpan.textContent = record.score;
            
            item.appendChild(rankSpan);
            item.appendChild(nameSpan);
            item.appendChild(scoreSpan);
            
            if (record.comment) {
              const commentDiv = document.createElement('div');
              commentDiv.className = 'comment-bubble';
              commentDiv.textContent = record.comment;
              item.appendChild(commentDiv);
            }
            
            list.appendChild(item);
          });
          
          difficultySection.appendChild(list);
          songSection.appendChild(difficultySection);
        }
        gameSection.appendChild(songSection);
      }
      rankingContainer.appendChild(gameSection);
    }
  }

  function loadRankings() {
    if (!IS_RANKING_PUBLIC) {
      rankingContainer.innerHTML = '<p>ランキング公開を停止しました！結果発表日をお待ちください。</p>';
      rankingContainer.style.color = '#333'; 
      return; 
    }

    rankingContainer.innerHTML = '<p>ランキングを読み込み中...</p>';
    rankingContainer.style.color = '#333';
    
    fetch(GAS_WEB_APP_URL) 
      .then(response => {
        if (!response.ok) {
          throw new Error('ネットワーク応答がありませんでした。');
        }
        return response.json();
      })
      .then(data => {
        if (data.result === 'error') {
          throw new Error('GAS側でエラーが発生: ' + data.message);
        }
        displayRankings(data);
      })
      .catch(error => {
        rankingContainer.innerHTML = '<p>ランキングの読み込みに失敗しました: ' + error.message + '</p>';
        rankingContainer.style.color = 'red';
      });
  }

  gameDescription.style.display = 'none';
  loadRankings();
});
