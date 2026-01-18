import document from "document";
import { display } from "display";
import clock from "clock";
import * as fs from "fs"; // Dosya sistemi

// --- AYARLAR ---
const GRAVITY = 0.7;
const LIFT = -9;
const GAP_SIZE = 110; 
const SCREEN_HEIGHT = 336;
const GROUND_Y = 300;
const INITIAL_SPEED = 3.5;
const HIGHSCORE_FILE = "highscore.json"; // Kayıt dosyası

let currentPipeSpeed = INITIAL_SPEED;

// --- GÖRSEL BOYUTLARI ---
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X_POS = 63;
const PIPE_TOTAL_WIDTH = 52; 
const PIPE_CAP_HEIGHT = 26; 

// --- Oyun Durumları ---
const STATE_START = 0;   // Bekleme ekranı
const STATE_PLAYING = 1; // Oyun oynanıyor
const STATE_PAUSED = 2;  // Bildirim geldi / Ekran kapandı
const STATE_GAMEOVER = 3;// Yandı

let gameState = STATE_START;

// --- Değişkenler ---
let birdY = 168;
let velocity = 0;
let score = 0;
let highScoreData = { score: 0, date: "---" }; // Varsayılan rekor
let animationFrameRequest;
let isHardMode = false;

// --- DOM Elemanları ---
const bird = document.getElementById("bird");
const scoreText = document.getElementById("score-text");
const timeText = document.getElementById("time-text");
const touchLayer = document.getElementById("touch-layer");

const startScreen = document.getElementById("start-screen");
const startHighScoreText = document.getElementById("start-high-score");

const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreText = document.getElementById("final-score");
const endHighScoreText = document.getElementById("end-high-score");

const pausedText = document.getElementById("paused-text");

const pipePairs = [
  { group: document.getElementById("pipe-pair-1"), top: document.getElementById("top-pipe-1"), bottom: document.getElementById("bottom-pipe-1"), x: 350, passed: false },
  { group: document.getElementById("pipe-pair-2"), top: document.getElementById("top-pipe-2"), bottom: document.getElementById("bottom-pipe-2"), x: 550, passed: false }
];

display.autoOff = false;

// --- YENİ: Dosya İşlemleri (High Score) ---
function loadHighScore() {
  try {
    // Dosya varsa oku
    if (fs.existsSync(HIGHSCORE_FILE)) {
      highScoreData = fs.readFileSync(HIGHSCORE_FILE, "json");
    }
  } catch (err) {
    console.error("High Score okuma hatası: " + err);
    // Hata olursa varsayılan kalır
  }
  updateHighScoreUI();
}

function saveHighScore() {
  try {
    fs.writeFileSync(HIGHSCORE_FILE, highScoreData, "json");
  } catch (err) {
    console.error("High Score yazma hatası: " + err);
  }
}

function updateHighScoreUI() {
  const text = `${highScoreData.score} (${highScoreData.date})`;
  startHighScoreText.text = text;
  endHighScoreText.text = text;
}

// Şu anki tarihi formatla (GG.AA.YYYY)
function getCurrentDate() {
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1; // Ay 0'dan başlar
  let year = today.getFullYear();
  
  if(day < 10) day = '0' + day;
  if(month < 10) month = '0' + month;
  
  return `${day}.${month}.${year}`;
}

// --- SAAT ---
clock.granularity = "minutes";
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let mins = today.getMinutes();
  if (mins < 10) { mins = "0" + mins; }
  timeText.text = `${hours}:${mins}`;
};

// --- EKRAN DURUMU / PAUSE ---
// Bildirim gelirse veya ekran kapanırsa oyunu dondur
display.addEventListener("change", () => {
  if (!display.on) {
    // Ekran kapandıysa ve oyun oynanıyorsa PAUSE moduna al
    if (gameState === STATE_PLAYING) {
      gameState = STATE_PAUSED;
      cancelAnimationFrame(animationFrameRequest);
      // Ekranda PAUSED yazısı gösterilebilir veya devam edince dokunması beklenebilir
    }
  } else {
    // Ekran açıldı
    if (gameState === STATE_PAUSED) {
      // Direkt başlamak yerine "Paused" yazısı gösterelim, dokununca devam etsin
      pausedText.style.display = "inline";
    }
  }
});

function init() {
  loadHighScore(); // Rekoru yükle
  
  // Başlangıç durumu ayarla
  gameState = STATE_START;
  startScreen.style.display = "inline";
  gameOverScreen.style.display = "none";
  scoreText.text = ""; // Bekleme ekranında skoru gizle
  
  // Kuşu ortada tut
  birdY = 168;
  bird.y = birdY - (BIRD_HEIGHT / 2);
  
  touchLayer.onclick = handleInput;
}

function handleInput() {
  if (gameState === STATE_START) {
    // Oyunu Başlat
    startGame();
  } 
  else if (gameState === STATE_PLAYING) {
    // Zıpla
    velocity = LIFT;
  } 
  else if (gameState === STATE_PAUSED) {
    // Pause'dan çık ve devam et
    gameState = STATE_PLAYING;
    pausedText.style.display = "none";
    gameLoop(); // Döngüyü tekrar başlat
    velocity = LIFT; // İlk dokunuşla zıplasın
  }
  else if (gameState === STATE_GAMEOVER) {
    // Yeniden Başlat (Start ekranına dön)
    init();
  }
}

function startGame() {
  resetGameEntities();
  gameState = STATE_PLAYING;
  startScreen.style.display = "none";
  scoreText.text = "0";
  
  // Hareketi başlat
  velocity = LIFT;
  gameLoop();
}

function gameLoop() {
  // Eğer oyun oynamıyorsa döngüyü kır
  if (gameState !== STATE_PLAYING) return;

  updateBird();
  updatePipes();
  checkCollisions();
  
  animationFrameRequest = requestAnimationFrame(gameLoop);
}

function updateBird() {
  velocity += GRAVITY;
  birdY += velocity;

  if (birdY + (BIRD_HEIGHT / 2) >= GROUND_Y) { 
    birdY = GROUND_Y - (BIRD_HEIGHT / 2);
    gameOver();
  }
  if (birdY - (BIRD_HEIGHT / 2) < 0) {
    birdY = BIRD_HEIGHT / 2;
    velocity = 0;
  }
  
  bird.y = birdY - (BIRD_HEIGHT / 2);

  if (velocity < -2) bird.href = "bird-down.png";
  else if (velocity > 2) bird.href = "bird-up.png";
  else bird.href = "bird-mid.png";
}

function updatePipes() {
  if (score > 10 && !isHardMode) {
    currentPipeSpeed = 4.5;
    isHardMode = true;
  }

  pipePairs.forEach(pair => {
    pair.x -= currentPipeSpeed;

    if (pair.x < -PIPE_TOTAL_WIDTH) { 
      pair.x = 350;
      pair.passed = false;
      randomizePipeHeights(pair);
    }

    pair.group.groupTransform.translate.x = pair.x;

    if (!pair.passed && pair.x < BIRD_X_POS - PIPE_TOTAL_WIDTH) {
      score++;
      scoreText.text = score;
      pair.passed = true;
    }
  });
}

function setPipeHeight(pipeElement, height, isTopPipe) {
  const body = pipeElement.getElementById("body");
  const bodyHighlight = pipeElement.getElementById("body-highlight");
  const cap = pipeElement.getElementById("cap");
  const capHighlight = pipeElement.getElementById("cap-highlight");

  const bodyHeight = Math.max(0, height - PIPE_CAP_HEIGHT);
  
  body.height = bodyHeight;
  bodyHighlight.height = bodyHeight;

  if (isTopPipe) {
    cap.y = bodyHeight;
    capHighlight.y = bodyHeight;
  }
}

function randomizePipeHeights(pair) {
  let topTotalHeight = Math.floor(Math.random() * (GROUND_Y - GAP_SIZE - 80)) + 50;
  setPipeHeight(pair.top, topTotalHeight, true);
  
  const bottomY = topTotalHeight + GAP_SIZE;
  let bottomTotalHeight = GROUND_Y - bottomY;
  if (bottomTotalHeight < PIPE_CAP_HEIGHT) bottomTotalHeight = PIPE_CAP_HEIGHT;

  pair.bottom.y = bottomY;
  setPipeHeight(pair.bottom, bottomTotalHeight, false);
}

function checkCollisions() {
  const bx = BIRD_X_POS;
  const by = bird.y;
  const bw = BIRD_WIDTH;
  const bh = BIRD_HEIGHT;
  const padding = 5; 

  pipePairs.forEach(pair => {
    const topHeight = pair.top.getElementById("body").height + PIPE_CAP_HEIGHT;
    if (
      bx + padding < pair.x + PIPE_TOTAL_WIDTH &&
      bx + bw - padding > pair.x &&
      by + padding < topHeight
    ) {
      gameOver();
    }
    if (
      bx + padding < pair.x + PIPE_TOTAL_WIDTH &&
      bx + bw - padding > pair.x &&
      by + bh - padding > pair.bottom.y
    ) {
      gameOver();
    }
  });
}

function gameOver() {
  gameState = STATE_GAMEOVER;
  cancelAnimationFrame(animationFrameRequest);
  
  // High Score Kontrolü
  if (score > highScoreData.score) {
    highScoreData.score = score;
    highScoreData.date = getCurrentDate(); // Tarihi al
    saveHighScore(); // Kaydet
    updateHighScoreUI(); // Arayüzü güncelle
  }

  // Bitiş ekranını göster
  finalScoreText.text = score;
  gameOverScreen.style.display = "inline";
}

function resetGameEntities() {
  score = 0;
  scoreText.text = "0";
  birdY = 168;
  velocity = 0;
  currentPipeSpeed = INITIAL_SPEED;
  isHardMode = false;
  
  bird.href = "bird-mid.png"; 

  pipePairs[0].x = 350;
  randomizePipeHeights(pipePairs[0]);
  pipePairs[1].x = 550;
  randomizePipeHeights(pipePairs[1]);
  
  bird.y = birdY - (BIRD_HEIGHT / 2);
  pipePairs.forEach(p => {
    p.group.groupTransform.translate.x = p.x;
  });
  
  pausedText.style.display = "none";
}

// Uygulamayı başlat
init();
